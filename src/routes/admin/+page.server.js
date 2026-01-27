import { db, schema } from '$lib/server/db/index.js';
import { eq, desc, count, sql } from 'drizzle-orm';

export function load({ locals }) {
    const user = locals.user;

    // Get post counts
    let postsQuery = db.select().from(schema.posts);

    // If author, only count their posts
    if (user.role === 'author') {
        postsQuery = postsQuery.where(eq(schema.posts.authorId, user.id));
    }

    const allPosts = postsQuery.all();
    const publishedPosts = allPosts.filter(p => p.published);
    const draftPosts = allPosts.filter(p => !p.published);

    // Get author count (admin only)
    let totalAuthors = 0;
    if (user.role === 'admin') {
        const authors = db.select().from(schema.users).where(eq(schema.users.role, 'author')).all();
        totalAuthors = authors.length;
    }

    // Get category count
    const categories = db.select().from(schema.categories).all();

    // Get recent posts with category info
    let recentPostsQuery = db
        .select({
            id: schema.posts.id,
            title: schema.posts.title,
            slug: schema.posts.slug,
            published: schema.posts.published,
            createdAt: schema.posts.createdAt,
            categoryId: schema.posts.categoryId
        })
        .from(schema.posts)
        .orderBy(desc(schema.posts.createdAt))
        .limit(5);

    if (user.role === 'author') {
        recentPostsQuery = db
            .select({
                id: schema.posts.id,
                title: schema.posts.title,
                slug: schema.posts.slug,
                published: schema.posts.published,
                createdAt: schema.posts.createdAt,
                categoryId: schema.posts.categoryId
            })
            .from(schema.posts)
            .where(eq(schema.posts.authorId, user.id))
            .orderBy(desc(schema.posts.createdAt))
            .limit(5);
    }

    const recentPosts = recentPostsQuery.all().map(post => {
        const category = post.categoryId ?
            db.select().from(schema.categories).where(eq(schema.categories.id, post.categoryId)).get()
            : null;
        return {
            ...post,
            categoryName: category?.name || null
        };
    });

    // Get total views
    const totalViewsResult = db.select({ total: sql`sum(${schema.pageViews.views})` }).from(schema.pageViews).get();
    const totalViews = totalViewsResult?.total || 0;

    // Get top posts by views
    const topPosts = db
        .select({
            id: schema.posts.id,
            title: schema.posts.title,
            slug: schema.posts.slug,
            views: schema.pageViews.views
        })
        .from(schema.pageViews)
        .innerJoin(schema.posts, eq(schema.pageViews.postId, schema.posts.id))
        .orderBy(desc(schema.pageViews.views))
        .limit(5)
        .all();

    return {
        user,
        stats: {
            totalPosts: allPosts.length,
            publishedPosts: publishedPosts.length,
            draftPosts: draftPosts.length,
            totalAuthors,
            totalCategories: categories.length,
            totalViews
        },
        recentPosts,
        topPosts
    };
}
