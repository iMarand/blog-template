import { db, schema } from '$lib/server/db/index.js';
import { desc, like, or, and, eq } from 'drizzle-orm';

export async function load({ url }) {
    const query = url.searchParams.get('q') || '';

    if (!query.trim()) {
        return {
            posts: [],
            query
        };
    }

    const searchTerm = `%${query}%`;

    // Search for posts containing the query in title, content, or excerpt
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
                eq(schema.posts.published, 1),
                or(
                    like(schema.posts.title, searchTerm),
                    like(schema.posts.content, searchTerm),
                    like(schema.posts.excerpt, searchTerm)
                )
            )
        )
        .orderBy(desc(schema.posts.publishedAt))
        .all();

    return {
        posts,
        query
    };
}
