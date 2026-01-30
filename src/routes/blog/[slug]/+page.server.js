import { db, schema } from '$lib/server/db/index.js';
import { readMarkdownFile, parseMarkdown } from '$lib/server/storage/filesystem.js';
import { marked } from 'marked';
import hljs from 'highlight.js';
import { error } from '@sveltejs/kit';
import { sql, eq, and, desc } from 'drizzle-orm';
import { trackView } from '$lib/server/stats.js';

// Configure marked with syntax highlighting
marked.setOptions({
    highlight: function (code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
    },
    breaks: true,
    gfm: true
});

export async function load({ params, setHeaders }) {
    const { slug } = params;

    // Disable caching for individual posts to ensure author/comment updates are seen immediately
    setHeaders({
        'cache-control': 'max-age=0, s-maxage=60' // Cache for 1 min on CDN, 0 on browser
    });

    // Get post metadata from database
    const post = db
        .select({
            id: schema.posts.id,
            title: schema.posts.title,
            slug: schema.posts.slug,
            excerpt: schema.posts.excerpt,
            featuredImage: schema.posts.featuredImage,
            publishedAt: schema.posts.publishedAt,
            authorId: schema.posts.authorId,
            authorName: schema.users.displayName,
            authorBio: schema.users.bio,
            authorAvatar: schema.users.avatarUrl,
            categoryId: schema.posts.categoryId,
            categoryName: schema.categories.name,
            categorySlug: schema.categories.slug,
            categoryColor: schema.categories.color
        })
        .from(schema.posts)
        .leftJoin(schema.categories, eq(schema.posts.categoryId, schema.categories.id))
        .leftJoin(schema.users, eq(schema.posts.authorId, schema.users.id))
        .where(and(eq(schema.posts.slug, slug), eq(schema.posts.published, 1)))
        .get();

    if (post && post.publishedAt instanceof Date) {
        post.publishedAt = Math.floor(post.publishedAt.getTime() / 1000);
    }

    if (!post) {
        throw error(404, 'Post not found');
    }

    // Track view
    await trackView(slug, post.id);

    // Read markdown file
    const markdownContent = readMarkdownFile(slug);
    if (!markdownContent) {
        throw error(404, 'Post content not found');
    }

    // Parse markdown
    const { content } = parseMarkdown(markdownContent);
    let html = marked(content);

    // Inject Ad Placeholders every 4 paragraphs for better flow
    function injectAds(html) {
        // We look for </p> to find paragraph ends
        const paragraphs = html.split('</p>');
        if (paragraphs.length <= 4) return html;

        let result = '';
        paragraphs.forEach((p, i) => {
            // Reconstruct the paragraph
            result += p + (p.trim() ? '</p>' : '');

            // Inject after 2nd paragraph, and then every 4 paragraphs
            // but not if it's the very last paragraph
            if ((i === 1 || (i > 1 && (i - 1) % 4 === 0)) && i < paragraphs.length - 1) {
                result += '<div class="ad-slot-auto"></div>';
            }
        });
        return result;
    }

    html = injectAds(html);

    // Calculate reading time (approx 200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    // Get tags
    const tags = db
        .select({ tag: schema.postTags.tag })
        .from(schema.postTags)
        .where(sql`${schema.postTags.postId} = ${post.id}`)
        .all()
        .map((t) => t.tag);

    // Get related posts (same category)
    const relatedPosts = post.categoryId
        ? db
            .select({
                id: schema.posts.id,
                title: schema.posts.title,
                slug: schema.posts.slug,
                excerpt: schema.posts.excerpt,
                featuredImage: schema.posts.featuredImage,
                publishedAt: schema.posts.publishedAt
            })
            .from(schema.posts)
            .where(sql`${schema.posts.categoryId} = ${post.categoryId} AND ${schema.posts.slug} != ${slug} AND ${schema.posts.published} = 1`)
            .limit(3)
            .all()
        : [];

    // Fetch approved comments
    const comments = db.select()
        .from(schema.comments)
        .where(and(eq(schema.comments.postId, post.id), eq(schema.comments.approved, 1)))
        .orderBy(desc(schema.comments.createdAt))
        .all();

    // Find Previous and Next posts
    const previousPost = db
        .select({ title: schema.posts.title, slug: schema.posts.slug })
        .from(schema.posts)
        .where(and(eq(schema.posts.published, 1), sql`${schema.posts.publishedAt} < ${post.publishedAt}`))
        .orderBy(desc(schema.posts.publishedAt))
        .limit(1)
        .get();

    const nextPost = db
        .select({ title: schema.posts.title, slug: schema.posts.slug })
        .from(schema.posts)
        .where(and(eq(schema.posts.published, 1), sql`${schema.posts.publishedAt} > ${post.publishedAt}`))
        .orderBy(schema.posts.publishedAt)
        .limit(1)
        .get();

    // Now normalize for frontend
    if (post && post.publishedAt instanceof Date) {
        post.publishedAt = Math.floor(post.publishedAt.getTime() / 1000);
    }

    return {
        post: { ...post, html, tags, readingTime },
        relatedPosts,
        comments,
        previousPost,
        nextPost
    };
}
