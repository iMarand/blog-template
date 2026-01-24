import { db, schema } from '$lib/server/db/index.js';
import { eq, desc } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export function load({ locals }) {
    const user = locals.user;

    // Get posts with category and author info
    let postsQuery = db
        .select({
            id: schema.posts.id,
            title: schema.posts.title,
            slug: schema.posts.slug,
            published: schema.posts.published,
            createdAt: schema.posts.createdAt,
            categoryId: schema.posts.categoryId,
            authorId: schema.posts.authorId
        })
        .from(schema.posts)
        .orderBy(desc(schema.posts.createdAt));

    // Authors can only see their own posts
    if (user.role === 'author') {
        postsQuery = db
            .select({
                id: schema.posts.id,
                title: schema.posts.title,
                slug: schema.posts.slug,
                published: schema.posts.published,
                createdAt: schema.posts.createdAt,
                categoryId: schema.posts.categoryId,
                authorId: schema.posts.authorId
            })
            .from(schema.posts)
            .where(eq(schema.posts.authorId, user.id))
            .orderBy(desc(schema.posts.createdAt));
    }

    const posts = postsQuery.all().map(post => {
        const category = post.categoryId
            ? db.select().from(schema.categories).where(eq(schema.categories.id, post.categoryId)).get()
            : null;

        const author = post.authorId
            ? db.select().from(schema.users).where(eq(schema.users.id, post.authorId)).get()
            : null;

        return {
            ...post,
            categoryName: category?.name || null,
            categoryColor: category?.color || '#3b82f6',
            authorName: author?.displayName || author?.username || null
        };
    });

    return {
        posts,
        user
    };
}

export const actions = {
    delete: async ({ request, locals }) => {
        const data = await request.formData();
        const postId = parseInt(data.get('postId')?.toString() || '0');

        if (!postId) {
            return fail(400, { error: 'Invalid post ID' });
        }

        // Get the post to check ownership
        const post = db
            .select()
            .from(schema.posts)
            .where(eq(schema.posts.id, postId))
            .get();

        if (!post) {
            return fail(404, { error: 'Post not found' });
        }

        // Authors can only delete their own posts
        if (locals.user.role === 'author' && post.authorId !== locals.user.id) {
            return fail(403, { error: 'You can only delete your own posts' });
        }

        // Delete the post
        db.delete(schema.posts).where(eq(schema.posts.id, postId)).run();

        return { success: true };
    }
};
