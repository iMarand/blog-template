import { fail } from '@sveltejs/kit';
import { generatePasswordResetToken } from '$lib/server/auth.js';

export const actions = {
    default: async ({ request, url }) => {
        const data = await request.formData();
        const email = data.get('email')?.toString().trim().toLowerCase();

        if (!email) {
            return fail(400, {
                error: 'Please enter your email address',
                email
            });
        }

        const result = await generatePasswordResetToken(email);

        if (!result) {
            // Don't reveal if email exists or not for security
            return { success: true };
        }

        // In production, you would send an email here
        // For now, log the reset link to the console
        const resetUrl = `${url.origin}/admin/reset-password/${result.token}`;
        console.log('\n========================================');
        console.log('PASSWORD RESET LINK');
        console.log('========================================');
        console.log(`User: ${result.user.username} (${result.user.email})`);
        console.log(`Reset URL: ${resetUrl}`);
        console.log('This link expires in 1 hour');
        console.log('========================================\n');

        return { success: true };
    }
};
