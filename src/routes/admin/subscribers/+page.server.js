import { db, schema } from '$lib/server/db/index.js';
import { fail } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';

export const load = async ({ locals }) => {
    // Only admin can see subscribers
    if (locals.user.role !== 'admin') {
        throw fail(403, { error: 'Unauthorized' });
    }

    const subscribers = db
        .select()
        .from(schema.subscribers)
        .orderBy(desc(schema.subscribers.createdAt))
        .all();

    return {
        subscribers
    };
};

export const actions = {
    deleteSubscriber: async ({ request, locals }) => {
        if (locals.user.role !== 'admin') {
            return fail(403, { error: 'Unauthorized' });
        }

        const data = await request.formData();
        const id = parseInt(data.get('id')?.toString());

        if (isNaN(id)) {
            return fail(400, { error: 'Invalid ID' });
        }

        try {
            db.delete(schema.subscribers)
                .where(eq(schema.subscribers.id, id))
                .run();

            return { success: true };
        } catch (e) {
            console.error('Delete subscriber error:', e);
            return fail(500, { error: 'Failed to delete subscriber' });
        }
    }
};
