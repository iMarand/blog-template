import { db, schema } from '$lib/server/db/index.js';
import { redirect, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const actions = {
    default: async ({ request }) => {
        const data = await request.formData();
        const title = data.get('title')?.toString().trim();
        const content = data.get('content')?.toString() || '';
        const action = data.get('action')?.toString();
        const inSitemap = data.get('inSitemap') === 'true';

        if (!title) {
            return fail(400, { error: 'Title is required', title, content });
        }

        let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

        // Check slug collision
        const exists = db.select().from(schema.pages).where(eq(schema.pages.slug, slug)).get();
        if (exists) {
            slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
        }

        const isPublish = action === 'publish';

        db.insert(schema.pages).values({
            title,
            slug,
            content,
            published: isPublish,
            inSitemap,
            updatedAt: new Date()
        }).run();

        throw redirect(303, '/admin/pages');
    }
};
