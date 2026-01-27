import { db, schema } from './db/index.js';
import { eq, sql } from 'drizzle-orm';

/**
 * Increments the view count for a given slug.
 * @param {string} slug - The slug of the post or page.
 * @param {number|null} postId - The ID of the post (optional for static pages).
 */
export async function trackView(slug, postId = null) {
    try {
        // Upsert logic for page_views
        const exists = db.select().from(schema.pageViews).where(eq(schema.pageViews.slug, slug)).get();

        if (exists) {
            db.update(schema.pageViews)
                .set({
                    views: exists.views + 1,
                    updatedAt: new Date()
                })
                .where(eq(schema.pageViews.slug, slug))
                .run();
        } else {
            db.insert(schema.pageViews)
                .values({
                    slug,
                    postId,
                    views: 1,
                    updatedAt: new Date()
                })
                .run();
        }
    } catch (e) {
        console.error(`[Stats] Failed to track view for ${slug}:`, e);
    }
}

/**
 * Gets the total view count for a given slug.
 * @param {string} slug 
 * @returns {number}
 */
export function getViews(slug) {
    const row = db.select({ views: schema.pageViews.views })
        .from(schema.pageViews)
        .where(eq(schema.pageViews.slug, slug))
        .get();
    return row?.views || 0;
}
