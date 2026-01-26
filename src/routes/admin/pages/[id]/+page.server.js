import { db, schema } from '$lib/server/db/index.js';
import { redirect, fail, error } from '@sveltejs/kit';
import { eq, and, ne } from 'drizzle-orm';

export async function load({ params }) {
    const id = parseInt(params.id);
    const page = db.select().from(schema.pages).where(eq(schema.pages.id, id)).get();

    if (!page) throw error(404, 'Page not found');

    return { page };
}

export const actions = {
    update: async ({ request, params }) => {
        const id = parseInt(params.id);
        const data = await request.formData();
        const title = data.get('title')?.toString().trim();
        const content = data.get('content')?.toString() || '';
        const action = data.get('action')?.toString();
        const inSitemap = data.get('inSitemap') === 'true';

        if (!title) {
            return fail(400, { error: 'Title is required', title, content });
        }

        const existingPage = db.select().from(schema.pages).where(eq(schema.pages.id, id)).get();
        if (!existingPage) throw error(404, 'Page not found');

        let slug = existingPage.slug;
        if (existingPage.title !== title) {
            slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            const collision = db.select().from(schema.pages).where(and(eq(schema.pages.slug, slug), ne(schema.pages.id, id))).get();
            if (collision) slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
        }

        let published = existingPage.published;
        if (action === 'publish') published = true;
        else if (action === 'unpublish') published = false;

        db.update(schema.pages).set({
            title,
            slug,
            content,
            published,
            inSitemap,
            updatedAt: new Date()
        }).where(eq(schema.pages.id, id)).run();

        return { success: true };
    },

    delete: async ({ params }) => {
        const id = parseInt(params.id);
        db.delete(schema.pages).where(eq(schema.pages.id, id)).run();
        throw redirect(303, '/admin/pages');
    }
};
