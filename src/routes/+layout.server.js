import { db, schema } from '$lib/server/db/index.js';
import { sql, eq, and, desc } from 'drizzle-orm';

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
        .innerJoin(schema.posts, and(eq(schema.categories.id, schema.posts.categoryId), eq(schema.posts.published, 1)))
        .groupBy(schema.categories.id)
        .orderBy(schema.categories.name)
        .all();

    // Get latest posts for footer
    const latestPosts = db
        .select({
            title: schema.posts.title,
            slug: schema.posts.slug,
            featuredImage: schema.posts.featuredImage,
            publishedAt: schema.posts.publishedAt,
            categoryName: schema.categories.name
        })
        .from(schema.posts)
        .leftJoin(schema.categories, eq(schema.posts.categoryId, schema.categories.id))
        .where(eq(schema.posts.published, 1))
        .orderBy(desc(schema.posts.publishedAt))
        .limit(3)
        .all();

    // Fetch published pages for footer
    const footerPages = db
        .select({
            title: schema.pages.title,
            slug: schema.pages.slug,
            externalUrl: schema.pages.externalUrl
        })
        .from(schema.pages)
        .where(eq(schema.pages.published, 1))
        .orderBy(schema.pages.title)
        .all();

    // Get all settings
    const allSettings = db.select().from(schema.settings).all();
    const siteSettings = allSettings.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {});

    // Backward compatibility for blogName
    const blogName = siteSettings.blog_name || 'NewsWeek';

    return {
        commonCategories: categories,
        latestPosts: latestPosts,
        footerPages,
        blogName,
        siteSettings
    };
}
