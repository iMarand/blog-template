import { db, schema } from '$lib/server/db/index.js';
import { fail } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';

export async function load() {
    // Fetch all settings
    const allSettings = db.select().from(schema.settings).all();

    // Convert array to object for easier access
    const settings = allSettings.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {});

    return {
        settings
    };
}

export const actions = {
    updateSettings: async ({ request }) => {
        const formData = await request.formData();
        const settingsToUpdate = [
            'blog_name',
            'blog_description',
            'social_facebook',
            'social_twitter',
            'social_youtube',
            'social_instagram',
            'social_tiktok',
            'contact_email',
            'contact_phone',
            'contact_address'
        ];

        try {
            for (const key of settingsToUpdate) {
                const value = formData.get(key)?.toString() || '';

                // Check if setting exists
                const existing = db.select().from(schema.settings).where(sql`${schema.settings.key} = ${key}`).get();

                if (existing) {
                    db.update(schema.settings)
                        .set({ value, updatedAt: new Date() })
                        .where(sql`${schema.settings.key} = ${key}`)
                        .run();
                } else {
                    db.insert(schema.settings)
                        .values({ key, value })
                        .run();
                }
            }

            return { success: true };
        } catch (e) {
            console.error('Settings update error:', e);
            return fail(500, { error: 'Failed to update settings' });
        }
    }
};
