import { db, schema } from '$lib/server/db/index.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const load = async ({ params, locals }) => {
    if (locals.user.role !== 'admin') {
        throw error(403, 'Unauthorized');
    }

    const id = parseInt(params.id);
    const author = db.select().from(schema.users).where(eq(schema.users.id, id)).get();

    if (!author) {
        throw error(404, 'Author not found');
    }

    return { author };
};

export const actions = {
    updateAuthor: async ({ request, params, locals }) => {
        if (locals.user.role !== 'admin') {
            return fail(403, { error: 'Unauthorized' });
        }

        const id = parseInt(params.id);
        const data = await request.formData();
        const displayName = data.get('displayName')?.toString().trim();
        const email = data.get('email')?.toString().trim();
        const bio = data.get('bio')?.toString().trim() || null;
        let avatarUrl = data.get('avatarUrl')?.toString().trim() || null;
        const avatarFile = data.get('avatarFile');

        if (avatarFile && avatarFile instanceof File && avatarFile.size > 0) {
            try {
                const { saveUpload } = await import('$lib/server/storage/filesystem.js');
                const filename = await saveUpload(avatarFile);
                avatarUrl = `/api/uploads/${filename}`;
            } catch (e) {
                console.error('Failed to upload avatar:', e);
            }
        }

        if (!displayName) {
            return fail(400, { error: 'Display name is required' });
        }

        try {
            db.update(schema.users)
                .set({
                    displayName,
                    email,
                    bio,
                    avatarUrl,
                    updatedAt: new Date()
                })
                .where(eq(schema.users.id, id))
                .run();

            return { success: true };
        } catch (e) {
            console.error('Author update error:', e);
            return fail(500, { error: 'Failed to update author' });
        }
    }
};
