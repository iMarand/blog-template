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
    // 1. Common Data
    const allPublished = db
        .select({
            id: schema.posts.id,
            title: schema.posts.title,
            slug: schema.posts.slug,
            excerpt: schema.posts.excerpt,
            featuredImage: schema.posts.featuredImage,
            publishedAt: schema.posts.publishedAt,
            categoryName: schema.categories.name,
            categorySlug: schema.categories.slug
        })
        .from(schema.posts)
        .leftJoin(schema.categories, eq(schema.posts.categoryId, schema.categories.id))
        .where(eq(schema.posts.published, true))
        .orderBy(desc(schema.posts.publishedAt))
        .limit(50)
        .all();

    // Enhancing posts with video detection for "Home only" logic
    const enhancedPosts = allPublished.map(post => {
        const content = readMarkdownFile(post.slug);
        const videoUrl = extractVideoUrl(content);
        // If no featured image but has video, or if we just want to mark it has video
        return { ...post, videoUrl };
    });

    // 2. Sections Mapping
    const carouselPosts = enhancedPosts.slice(0, 4);

    // Hero Layout
    const freshStories = enhancedPosts.slice(4, 9);
    const heroFeatured = enhancedPosts[9] || enhancedPosts[0];
    const popularVisual = enhancedPosts.slice(10, 12);
    const popularList = enhancedPosts.slice(12, 17);

    // Breaking Layout
    const breakingGrid = enhancedPosts.slice(17, 21);
    const breakingList = enhancedPosts.slice(21, 29);

    // Recent Layout
    const recentFeatured = enhancedPosts[29] || enhancedPosts[0];
    const recentGrid = enhancedPosts.slice(30, 36);
    const recentSidebarFeatured = enhancedPosts[36] || enhancedPosts[1];
    const recentSidebarList = enhancedPosts.slice(37, 42);

    const categories = db
        .select({
            name: schema.categories.name,
            slug: schema.categories.slug
        })
        .from(schema.categories)
        .all();

    return {
        carouselPosts,
        freshStories,
        heroFeatured,
        popularVisual,
        popularList,
        breakingGrid,
        breakingList,
        recentFeatured,
        recentGrid,
        recentSidebarFeatured,
        recentSidebarList,
        categories
    };
}
