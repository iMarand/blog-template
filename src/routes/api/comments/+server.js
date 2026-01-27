import { db, schema } from '$lib/server/db/index.js';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
    try {
        const { postId, authorName, authorEmail, content } = await request.json();

        if (!postId || !authorName || !content) {
            return json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        // Basic spam prevention (could be improved)
        if (content.length < 2) {
            return json({ success: false, error: 'Comment too short' }, { status: 400 });
        }

        db.insert(schema.comments).values({
            postId: parseInt(postId),
            authorName: authorName.trim(),
            authorEmail: authorEmail?.trim() || null,
            content: content.trim(),
            approved: true, // Auto-approve for now as requested "implement comment section"
            createdAt: new Date()
        }).run();

        return json({ success: true });
    } catch (e) {
        console.error('[API Comments] Error:', e);
        return json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
