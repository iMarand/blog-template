import { db, schema } from '$lib/server/db/index.js';
import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const load = async ({ locals }) => {
    // Load site settings
    const settingsList = db.select().from(schema.settings).all();
    const settings = settingsList.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {});

    return {
        user: locals.user,
        settings
    };
};

export const actions = {
    updateProfile: async ({ request, locals }) => {
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
            return fail(400, { profileError: 'Display name is required', displayName, email, bio, avatarUrl });
        }

        if (!email) {
            return fail(400, { profileError: 'Email is required', displayName, email, bio, avatarUrl });
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
                .where(eq(schema.users.id, locals.user.id))
                .run();

            return { profileSuccess: true };
        } catch (e) {
            console.error('Profile update error:', e);
            return fail(500, { profileError: 'Failed to update profile' });
        }
    },

    deleteAvatar: async ({ locals }) => {
        try {
            db.update(schema.users)
                .set({
                    avatarUrl: null,
                    updatedAt: new Date()
                })
                .where(eq(schema.users.id, locals.user.id))
                .run();

            return { profileSuccess: true };
        } catch (e) {
            console.error('Delete avatar error:', e);
            return fail(500, { profileError: 'Failed to delete avatar' });
        }
    },

    changePassword: async ({ request, locals }) => {
        const data = await request.formData();
        const currentPassword = data.get('currentPassword')?.toString();
        const newPassword = data.get('newPassword')?.toString();
        const confirmPassword = data.get('confirmPassword')?.toString();

        if (!currentPassword || !newPassword || !confirmPassword) {
            return fail(400, { passwordError: 'All fields are required' });
        }

        if (newPassword !== confirmPassword) {
            return fail(400, { passwordError: 'New passwords do not match' });
        }

        if (newPassword.length < 8) {
            return fail(400, { passwordError: 'Password must be at least 8 characters long' });
        }

        // Get current user password hash (refresh from DB to be safe)
        const user = db.select().from(schema.users).where(eq(schema.users.id, locals.user.id)).get();

        if (!user) {
            return fail(404, { passwordError: 'User not found' });
        }

        const validPassword = await bcrypt.compare(currentPassword, user.passwordHash);

        if (!validPassword) {
            return fail(400, { passwordError: 'Incorrect current password' });
        }

        const newHash = await bcrypt.hash(newPassword, 10);

        try {
            db.update(schema.users)
                .set({
                    passwordHash: newHash,
                    updatedAt: new Date()
                })
                .where(eq(schema.users.id, locals.user.id))
                .run();

            return { passwordSuccess: true };
        } catch (e) {
            console.error('Password change error:', e);
            return fail(500, { passwordError: 'Failed to update password' });
        }
    }
};
