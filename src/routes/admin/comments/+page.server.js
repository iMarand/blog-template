import { db, schema } from '$lib/server/db/index.js';
import { eq, desc } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export async function load() {
    const comments = db
        .select({
            id: schema.comments.id,
            authorName: schema.comments.authorName,
            authorEmail: schema.comments.authorEmail,
            content: schema.comments.content,
            approved: schema.comments.approved,
            createdAt: schema.comments.createdAt,
            postTitle: schema.posts.title,
            postSlug: schema.posts.slug
        })
        .from(schema.comments)
        .leftJoin(schema.posts, eq(schema.comments.postId, schema.posts.id))
        .orderBy(desc(schema.comments.createdAt))
        .all();

    return { comments };
}

export const actions = {
    approve: async ({ request }) => {
        const data = await request.formData();
        const id = parseInt(data.get('id')?.toString() || '0');
        if (id) {
            db.update(schema.comments).set({ approved: true }).where(eq(schema.comments.id, id)).run();
            return { success: true };
        }
        return fail(400, { error: 'Invalid ID' });
    },
    unapprove: async ({ request }) => {
        const data = await request.formData();
        const id = parseInt(data.get('id')?.toString() || '0');
        if (id) {
            db.update(schema.comments).set({ approved: false }).where(eq(schema.comments.id, id)).run();
            return { success: true };
        }
        return fail(400, { error: 'Invalid ID' });
    },
    delete: async ({ request }) => {
        const data = await request.formData();
        const id = parseInt(data.get('id')?.toString() || '0');
        if (id) {
            db.delete(schema.comments).where(eq(schema.comments.id, id)).run();
            return { success: true };
        }
        return fail(400, { error: 'Invalid ID' });
    }
};
