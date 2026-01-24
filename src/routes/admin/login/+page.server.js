import { redirect, fail } from '@sveltejs/kit';
import { verifyUser, createSession } from '$lib/server/auth.js';

export const actions = {
    default: async ({ request, cookies }) => {
        const data = await request.formData();
        const username = data.get('username')?.toString().trim();
        const password = data.get('password')?.toString();
        const remember = data.get('remember') === 'on';

        if (!username || !password) {
            return fail(400, {
                error: 'Please enter both username and password',
                username
            });
        }

        const user = await verifyUser(username, password);

        if (!user) {
            return fail(400, {
                error: 'Invalid username or password',
                username
            });
        }

        if (user.error) {
            return fail(400, {
                error: user.error,
                username
            });
        }

        // Create session cookie
        cookies.set('session', createSession(user), {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24 // 30 days or 1 day
        });

        throw redirect(303, '/admin');
    }
};
