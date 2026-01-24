import { db, schema } from '$lib/server/db/index.js';
import { readMarkdownFile, parseMarkdown } from '$lib/server/storage/filesystem.js';
import { marked } from 'marked';
import hljs from 'highlight.js';
import { error } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';

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

export async function load({ params }) {
    const { slug } = params;

    // Get post metadata from database
    const post = db
        .select({
            id: schema.posts.id,
            title: schema.posts.title,
            slug: schema.posts.slug,
            excerpt: schema.posts.excerpt,
            featuredImage: schema.posts.featuredImage,
            publishedAt: schema.posts.publishedAt,
            categoryId: schema.posts.categoryId,
            categoryName: schema.categories.name,
            categorySlug: schema.categories.slug,
            categoryColor: schema.categories.color
        })
        .from(schema.posts)
        .leftJoin(schema.categories, sql`${schema.posts.categoryId} = ${schema.categories.id}`)
        .where(sql`${schema.posts.slug} = ${slug} AND ${schema.posts.published} = 1`)
        .get();

    if (!post) {
        throw error(404, 'Post not found');
    }

    // Read markdown file
    const markdownContent = readMarkdownFile(slug);
    if (!markdownContent) {
        throw error(404, 'Post content not found');
    }

    // Parse markdown
    const { content } = parseMarkdown(markdownContent);
    const html = marked(content);

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

    return {
        post: { ...post, html, tags },
        relatedPosts
    };
}
