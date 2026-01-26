import { db, schema } from '$lib/server/db/index.js';
import { desc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export async function load({ locals }) {
    // Only admin can manage pages
    if (locals.user.role !== 'admin') {
        throw fail(403, { error: 'Unauthorized' });
    }

    const pages = db.select().from(schema.pages).orderBy(desc(schema.pages.createdAt)).all();

    return {
        pages
    };
}

export const actions = {
    delete: async ({ request, locals }) => {
        if (locals.user.role !== 'admin') {
            return fail(403, { error: 'Unauthorized' });
        }

        const data = await request.formData();
        const id = parseInt(data.get('id')?.toString());

        if (!id) {
            return fail(400, { error: 'Invalid ID' });
        }

        try {
            db.delete(schema.pages).where(eq(schema.pages.id, id)).run();
            return { success: true };
        } catch (e) {
            console.error('Delete page error:', e);
            return fail(500, { error: 'Failed to delete page' });
        }
    }
};
