import { isAuthenticated } from '$lib/server/auth.js';
import { redirect } from '@sveltejs/kit';

// Routes that don't require authentication
const publicRoutes = [
    '/admin/login',
    '/admin/forgot-password',
    '/admin/reset-password'
];

// Routes that require admin role only
const adminOnlyRoutes = [
    '/admin/authors'
];

export async function handle({ event, resolve }) {
    const path = event.url.pathname;

    // Check if this is an admin or admin-api route
    if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
        // Check if it's a public route (login, forgot password, etc.)
        const isPublicRoute = publicRoutes.some(route => path.startsWith(route));

        if (!isPublicRoute) {
            const user = isAuthenticated(event.cookies);

            if (!user) {
                throw redirect(303, '/admin/login');
            }

            // Check admin-only routes
            const isAdminOnly = adminOnlyRoutes.some(route => path.startsWith(route));
            if (isAdminOnly && user.role !== 'admin') {
                throw redirect(303, '/admin');
            }

            // Attach user to locals for use in load functions
            event.locals.user = user;
        }
    }

    return resolve(event);
}
