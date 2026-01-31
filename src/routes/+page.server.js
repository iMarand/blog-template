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

export async function load({ setHeaders }) {
    // Disable caching for the home page to ensure deleted posts disappear immediately
    setHeaders({
        'cache-control': 'max-age=0, s-maxage=60'
    });

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
            authorName: schema.users.displayName,
            authorAvatar: schema.users.avatarUrl,
            categoryName: schema.categories.name,
            categorySlug: schema.categories.slug
        })
        .from(schema.posts)
        .leftJoin(schema.categories, eq(schema.posts.categoryId, schema.categories.id))
        .leftJoin(schema.users, eq(schema.posts.authorId, schema.users.id))
        .where(eq(schema.posts.published, 1))
        .orderBy(desc(schema.posts.publishedAt))
        .limit(100)
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

    // 3. De-duplication Logic
    const shownIds = new Set();

    // Helper to get unique posts for a section
    function getUniquePosts(source, count, filter = () => true, allowOverlap = false) {
        const result = [];
        for (const p of source) {
            if ((allowOverlap || !shownIds.has(p.id)) && filter(p)) {
                result.push(p);
                if (!allowOverlap) shownIds.add(p.id);
                if (result.length === count) break;
            }
        }
        return result;
    }

    // Hero Featured - PRIORITY 1: This must be the user-selected featured post
    let heroFeatured = enhancedPosts.find(p => p.isFeatured);
    if (!heroFeatured) {
        heroFeatured = enhancedPosts[0]; // Fallback to latest
    }
    // Always add Hero to shownIds
    if (heroFeatured) shownIds.add(heroFeatured.id);

    // Carousel: Priority 2 is Exclusive
    // We filter out the heroFeatured if it was picked
    const carouselPosts = getUniquePosts(enhancedPosts, 4, p => p.isExclusive);
    if (carouselPosts.length < 4) {
        const fillers = getUniquePosts(enhancedPosts, 4 - carouselPosts.length);
        carouselPosts.push(...fillers);
    }

    // Fresh Stories
    const freshStories = getUniquePosts(enhancedPosts, 5);

    // Breaking News / Exclusive Section: Allow overlap for isExclusive posts 
    // but try to keep them unique within THIS section.
    // We already added carousel posts to shownIds. 
    // If we want them to reappear here, we use allowOverlap: true.
    const breakingGrid = getUniquePosts(enhancedPosts, 4, p => p.isExclusive, true);

    // For the list below the grid, we want to try to NOT duplicate what's in breakingGrid
    const gridIds = new Set(breakingGrid.map(p => p.id));
    const breakingBottomList = enhancedPosts
        .filter(p => p.isExclusive && !gridIds.has(p.id))
        .slice(0, 4);

    // New Section: Two Large Exclusive Posts
    const bottomIds = new Set(breakingBottomList.map(p => p.id));
    const breakingLargeFeatured = enhancedPosts
        .filter(p => p.isExclusive && !gridIds.has(p.id) && !bottomIds.has(p.id))
        .slice(0, 2);



    // If breakingGrid or breakingBottomList are still empty (no isExclusive posts at all),
    // maybe fill with latest news but that might defeat the "Exclusive" purpose.
    // However, the user said they HAVE Exclusive content.

    // Recent Content
    const recentFeatured = getUniquePosts(enhancedPosts, 1)[0] || enhancedPosts[0];
    const recentGrid = getUniquePosts(enhancedPosts, 6);

    const recentSidebarFeatured = getUniquePosts(enhancedPosts, 1)[0] || enhancedPosts[1];
    const recentSidebarList = getUniquePosts(enhancedPosts, 5);



    // Popular Posts Slices
    const popularVisual = popularPosts.slice(0, 2);
    const popularList = popularPosts.slice(2, 7);

    // 4. Categories aggregation
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
        carouselPosts,
        freshStories,
        heroFeatured,
        popularVisual,
        popularList,
        breakingGrid,
        breakingBottomList,
        breakingLargeFeatured,
        recentFeatured,
        recentGrid,
        recentSidebarFeatured,
        recentSidebarList,
        categories,
        popularPosts
    };
}
