import { db, schema } from '$lib/server/db/index.js';
import { error } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { marked } from 'marked';

export async function load({ params }) {
    const page = db
        .select()
        .from(schema.pages)
        .where(and(eq(schema.pages.slug, params.slug), eq(schema.pages.published, 1)))
        .get();

    if (!page) throw error(404, 'Page not found');

    return {
        page: {
            ...page,
            htmlContent: marked(page.content)
        }
    };
}
