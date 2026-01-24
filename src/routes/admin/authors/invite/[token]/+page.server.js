import { fail } from '@sveltejs/kit';
import { validateInviteToken, registerAuthor } from '$lib/server/auth.js';

export function load({ params }) {
    const token = params.token;
    const invite = validateInviteToken(token);

    return {
        valid: invite !== null,
        invite: invite ? { email: invite.email } : null
    };
}

export const actions = {
    default: async ({ request, params }) => {
        const data = await request.formData();
        const displayName = data.get('displayName')?.toString().trim();
        const username = data.get('username')?.toString().trim().toLowerCase();
        const email = data.get('email')?.toString().trim().toLowerCase();
        const password = data.get('password')?.toString();
        const confirmPassword = data.get('confirmPassword')?.toString();

        if (!displayName) {
            return fail(400, { error: 'Display name is required', displayName, username, email });
        }

        if (!username || !/^[a-z0-9_]+$/.test(username)) {
            return fail(400, { error: 'Username must contain only lowercase letters, numbers, and underscores', displayName, username, email });
        }

        if (!email) {
            return fail(400, { error: 'Email is required', displayName, username, email });
        }

        if (!password || password.length < 6) {
            return fail(400, { error: 'Password must be at least 6 characters', displayName, username, email });
        }

        if (password !== confirmPassword) {
            return fail(400, { error: 'Passwords do not match', displayName, username, email });
        }

        const result = await registerAuthor(params.token, username, email, password, displayName);

        if (result.error) {
            return fail(400, { error: result.error, displayName, username, email });
        }

        return { success: true };
    }
};
