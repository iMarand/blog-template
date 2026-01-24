import { redirect } from '@sveltejs/kit';

export function load() {
    throw redirect(307, '/admin/profile');
}

export const actions = {
    changePassword: async ({ request, locals }) => {
        const data = await request.formData();
        const currentPassword = data.get('currentPassword')?.toString();
        const newPassword = data.get('newPassword')?.toString();
        const confirmPassword = data.get('confirmPassword')?.toString();

        if (!currentPassword) {
            return fail(400, { passwordError: 'Current password is required' });
        }

        if (!newPassword || newPassword.length < 6) {
            return fail(400, { passwordError: 'New password must be at least 6 characters' });
        }

        if (newPassword !== confirmPassword) {
            return fail(400, { passwordError: 'Passwords do not match' });
        }

        const result = await updatePassword(locals.user.id, currentPassword, newPassword);

        if (result.error) {
            return fail(400, { passwordError: result.error });
        }

        return { passwordSuccess: true };
    }
};
