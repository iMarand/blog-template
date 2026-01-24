import { db, schema } from '$lib/server/db/index.js';
import { desc, like, or, and, eq } from 'drizzle-orm';
import { json } from '@sveltejs/kit';

export async function GET({ url }) {
    const query = url.searchParams.get('q') || '';

    if (!query.trim()) {
        return json({ posts: [] });
    }

    const searchTerm = `%${query}%`;

    try {
        const posts = db
            .select({
                title: schema.posts.title,
                slug: schema.posts.slug,
                excerpt: schema.posts.excerpt,
                featuredImage: schema.posts.featuredImage,
                publishedAt: schema.posts.publishedAt,
                categoryName: schema.categories.name,
                exclusive: sql`CASE WHEN ${schema.posts.excerpt} LIKE '%EXCLUSIVE%' THEN 1 ELSE 0 END`
            })
            .from(schema.posts)
            .leftJoin(schema.categories, eq(schema.posts.categoryId, schema.categories.id))
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
            .limit(6)
            .all();

        return json({ posts });
    } catch (e) {
        console.error('Search API error:', e);
        return json({ posts: [], error: e.message }, { status: 500 });
    }
}

// Helper to provide 'sql' for the CASE statement
import { sql } from 'drizzle-orm';
