import { fail } from '@sveltejs/kit';
import { validatePasswordResetToken, resetPassword } from '$lib/server/auth.js';

export function load({ params }) {
    const token = params.token;
    const valid = validatePasswordResetToken(token) !== null;

    return {
        valid
    };
}

export const actions = {
    default: async ({ request, params }) => {
        const data = await request.formData();
        const password = data.get('password')?.toString();
        const confirmPassword = data.get('confirmPassword')?.toString();

        if (!password || password.length < 6) {
            return fail(400, {
                error: 'Password must be at least 6 characters'
            });
        }

        if (password !== confirmPassword) {
            return fail(400, {
                error: 'Passwords do not match'
            });
        }

        const success = await resetPassword(params.token, password);

        if (!success) {
            return fail(400, {
                error: 'Invalid or expired reset token. Please request a new one.'
            });
        }

        return { success: true };
    }
};
