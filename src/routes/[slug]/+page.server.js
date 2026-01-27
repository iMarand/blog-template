import { db, schema } from '$lib/server/db/index.js';
import { error } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { marked } from 'marked';
import { trackView } from '$lib/server/stats.js';

export async function load({ params }) {
    const page = db
        .select()
        .from(schema.pages)
        .where(and(eq(schema.pages.slug, params.slug), eq(schema.pages.published, 1)))
        .get();

    if (!page) throw error(404, 'Page not found');

    // Track view (postId is null for static pages if they are not in posts table)
    await trackView(params.slug);

    return {
        page: {
            ...page,
            htmlContent: marked(page.content)
        }
    };
}
