import { db, schema } from '$lib/server/db/index.js';
import { error } from '@sveltejs/kit';
import { sql, desc, eq, and } from 'drizzle-orm';

export async function load({ params, setHeaders }) {
    const { slug } = params;

    // Disable caching for category pages
    setHeaders({
        'cache-control': 'max-age=0, s-maxage=60'
    });

    // Get category info
    const category = db
        .select()
        .from(schema.categories)
        .where(eq(schema.categories.slug, slug))
        .get();

    if (!category) {
        throw error(404, 'Category not found');
    }

    // Get all published posts in this category
    const posts = db
        .select({
            id: schema.posts.id,
            title: schema.posts.title,
            slug: schema.posts.slug,
            excerpt: schema.posts.excerpt,
            featuredImage: schema.posts.featuredImage,
            publishedAt: schema.posts.publishedAt,
            categoryName: schema.categories.name,
            categorySlug: schema.categories.slug,
            authorName: schema.users.displayName,
            authorAvatar: schema.users.avatarUrl
        })
        .from(schema.posts)
        .leftJoin(schema.categories, eq(schema.posts.categoryId, schema.categories.id))
        .leftJoin(schema.users, eq(schema.posts.authorId, schema.users.id))
        .where(
            and(
                eq(schema.posts.categoryId, category.id),
                eq(schema.posts.published, 1)
            )
        )
        .orderBy(desc(schema.posts.publishedAt))
        .all();

    return {
        category,
        posts
    };
}
