import { db, schema } from '$lib/server/db/index.js';
import { sql, desc, eq, and } from 'drizzle-orm';
import { readMarkdownFile } from '$lib/server/storage/filesystem.js';

function extractVideoUrl(content) {
    if (!content) return null;
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
    const instagramRegex = /instagram\.com\/(?:p|reels)\/([a-zA-Z0-9_-]+)/;

    const ytMatch = content.match(youtubeRegex);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

    const igMatch = content.match(instagramRegex);
    if (igMatch) return `https://www.instagram.com/p/${igMatch[1]}/embed`;

    return null;
}

export async function load() {
    // 1. Fetch Popular Posts
    const popularPostsRaw = db
        .select({
            id: schema.posts.id,
            title: schema.posts.title,
            slug: schema.posts.slug,
            excerpt: schema.posts.excerpt,
            featuredImage: schema.posts.featuredImage,
            publishedAt: schema.posts.publishedAt,
            categoryName: schema.categories.name,
            categorySlug: schema.categories.slug,
            views: schema.pageViews.views
        })
        .from(schema.posts)
        .leftJoin(schema.categories, eq(schema.posts.categoryId, schema.categories.id))
        .innerJoin(schema.pageViews, eq(schema.posts.id, schema.pageViews.postId))
        .where(eq(schema.posts.published, 1))
        .orderBy(desc(schema.pageViews.views))
        .limit(10)
        .all();

    // 2. Main Posts Fetch
    const allPublished = db
        .select({
            id: schema.posts.id,
            title: schema.posts.title,
            slug: schema.posts.slug,
            excerpt: schema.posts.excerpt,
            featuredImage: schema.posts.featuredImage,
            isFeatured: schema.posts.isFeatured,
            isExclusive: schema.posts.isExclusive,
            publishedAt: schema.posts.publishedAt,
            categoryName: schema.categories.name,
            categorySlug: schema.categories.slug
        })
        .from(schema.posts)
        .leftJoin(schema.categories, eq(schema.posts.categoryId, schema.categories.id))
        .where(eq(schema.posts.published, 1))
        .orderBy(desc(schema.posts.publishedAt))
        .limit(50)
        .all();

    const enhancedPosts = allPublished.map(post => {
        const content = readMarkdownFile(post.slug);
        const videoUrl = extractVideoUrl(content);
        const publishedAt = post.publishedAt instanceof Date ? Math.floor(post.publishedAt.getTime() / 1000) : post.publishedAt;
        return { ...post, videoUrl, publishedAt };
    });

    const popularPosts = popularPostsRaw.map(post => {
        const publishedAt = post.publishedAt instanceof Date ? Math.floor(post.publishedAt.getTime() / 1000) : post.publishedAt;
        return { ...post, publishedAt };
    });

    // 3. Mapping
    const carouselPosts = enhancedPosts.filter(p => p.isExclusive).slice(0, 4);
    const backupCarousel = enhancedPosts.filter(p => !p.isExclusive).slice(0, 4 - carouselPosts.length);
    const finalCarousel = [...carouselPosts, ...backupCarousel];

    const heroFeatured = enhancedPosts.find(p => p.isFeatured) || enhancedPosts[0];
    const freshStories = enhancedPosts.filter(p => p.id !== heroFeatured?.id).slice(0, 5);

    const breakingGrid = enhancedPosts
        .filter(p => p.isExclusive)
        .slice(0, 4);

    const breakingList = enhancedPosts
        .filter(p => p.isExclusive)
        .filter(p => !breakingGrid.some(bg => bg.id === p.id))
        .slice(0, 4);

    const popularVisual = popularPosts.slice(0, 2);
    const popularList = popularPosts.slice(2, 7);

    const recentFeatured = enhancedPosts.filter(p => p.id !== heroFeatured?.id).slice(5, 6)[0] || enhancedPosts[0];
    const recentGrid = enhancedPosts
        .filter(p => p.id !== heroFeatured?.id && p.id !== recentFeatured?.id)
        .slice(0, 6);

    const recentSidebarFeatured = enhancedPosts
        .filter(p => p.id !== heroFeatured?.id && !recentGrid.some(rg => rg.id === p.id))
        .slice(0, 1)[0] || enhancedPosts[1];

    const recentSidebarList = enhancedPosts
        .filter(p => p.id !== heroFeatured?.id && !recentGrid.some(rg => rg.id === p.id) && p.id !== recentSidebarFeatured?.id)
        .slice(0, 5);

    // 4. Categories (from Junction Table)
    const categories = db
        .select({
            name: schema.categories.name,
            slug: schema.categories.slug
        })
        .from(schema.categories)
        .innerJoin(schema.postCategories, eq(schema.categories.id, schema.postCategories.categoryId))
        .innerJoin(schema.posts, and(eq(schema.postCategories.postId, schema.posts.id), eq(schema.posts.published, 1)))
        .groupBy(schema.categories.id)
        .orderBy(schema.categories.name)
        .all();

    return {
        carouselPosts: finalCarousel,
        freshStories,
        heroFeatured,
        popularVisual,
        popularList,
        breakingGrid,
        recentGrid,
        recentSidebarFeatured,
        recentSidebarList,
        categories,
        popularPosts
    };
}
