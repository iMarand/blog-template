import { db, schema } from '$lib/server/db/index.js';
import { fail } from '@sveltejs/kit';
import { eq, isNull, and, gt } from 'drizzle-orm';
import { generateInviteToken, toggleAuthorStatus } from '$lib/server/auth.js';

export function load({ locals, url }) {
    // Get all authors with post counts
    const authors = db
        .select()
        .from(schema.users)
        .where(eq(schema.users.role, 'author'))
        .all()
        .map(author => {
            const postCount = db
                .select()
                .from(schema.posts)
                .where(eq(schema.posts.authorId, author.id))
                .all().length;

            return {
                id: author.id,
                username: author.username,
                email: author.email,
                displayName: author.displayName,
                active: author.active,
                createdAt: author.createdAt,
                postCount
            };
        });

    // Get pending (unused) invite tokens
    const now = new Date();
    const pendingInvites = db
        .select()
        .from(schema.inviteTokens)
        .where(and(
            isNull(schema.inviteTokens.usedAt),
            gt(schema.inviteTokens.expiresAt, now)
        ))
        .all();

    return {
        authors,
        pendingInvites
    };
}

export const actions = {
    invite: async ({ request, locals, url }) => {
        const data = await request.formData();
        const email = data.get('email')?.toString().trim().toLowerCase() || null;

        const token = generateInviteToken(email, locals.user.id);
        const inviteUrl = `${url.origin}/admin/authors/invite/${token}`;

        return {
            success: true,
            token,
            inviteUrl
        };
    },

    toggleStatus: async ({ request }) => {
        const data = await request.formData();
        const authorId = parseInt(data.get('authorId')?.toString() || '0');

        if (!authorId) {
            return fail(400, { error: 'Invalid author ID' });
        }

        const success = toggleAuthorStatus(authorId);

        if (!success) {
            return fail(400, { error: 'Failed to toggle author status' });
        }

        return { success: true };
    }
};
