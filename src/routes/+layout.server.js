import { db, schema } from '$lib/server/db/index.js';
import { sql, eq, and } from 'drizzle-orm';

export async function load() {
    // Get categories with post counts for the footer
    const categories = db
        .select({
            id: schema.categories.id,
            name: schema.categories.name,
            slug: schema.categories.slug,
            description: schema.categories.description,
            color: schema.categories.color,
            postCount: sql`count(${schema.posts.id})`
        })
        .from(schema.categories)
        .innerJoin(schema.posts, and(eq(schema.categories.id, schema.posts.categoryId), eq(schema.posts.published, true)))
        .groupBy(schema.categories.id)
        .orderBy(schema.categories.name)
        .all();

    // Get latest posts for footer
    const latestPosts = db
        .select({
            title: schema.posts.title,
            slug: schema.posts.slug,
            featuredImage: schema.posts.featuredImage,
            publishedAt: schema.posts.publishedAt
        })
        .from(schema.posts)
        .where(sql`${schema.posts.published} = 1`)
        .orderBy(sql`${schema.posts.publishedAt} DESC`)
        .limit(3)
        .all();

    // Get blog name from settings
    const blogNameSetting = db.select().from(schema.settings).where(sql`${schema.settings.key} = 'blog_name'`).get();
    const blogName = blogNameSetting?.value || 'NewsWeek';

    return {
        commonCategories: categories,
        latestPosts: latestPosts,
        blogName
    };
}
