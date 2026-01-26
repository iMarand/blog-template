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

        if (!displayName) {
            return fail(400, { profileError: 'Display name is required', displayName, email });
        }

        if (!email) {
            return fail(400, { profileError: 'Email is required', displayName, email });
        }

        try {
            db.update(schema.users)
                .set({
                    displayName,
                    email,
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

    updateSettings: async ({ request, locals }) => {
        // Only admin can update settings
        if (locals.user.role !== 'admin') {
            return fail(403, { settingsError: 'Unauthorized' });
        }

        const data = await request.formData();
        const blogName = data.get('blogName')?.toString().trim();

        if (!blogName) {
            return fail(400, { settingsError: 'Blog name is required' });
        }

        try {
            db.insert(schema.settings)
                .values({ key: 'blog_name', value: blogName, updatedAt: new Date() })
                .onConflictDoUpdate({
                    target: schema.settings.key,
                    set: { value: blogName, updatedAt: new Date() }
                })
                .run();

            return { settingsSuccess: true };
        } catch (e) {
            console.error('Settings update error:', e);
            return fail(500, { settingsError: 'Failed to update settings' });
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
