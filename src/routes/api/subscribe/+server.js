import { json } from '@sveltejs/kit';
import { db, schema } from '$lib/server/db/index.js';
import { sql } from 'drizzle-orm';

export async function POST({ request }) {
    try {
        const { email } = await request.json();

        if (!email || !email.includes('@')) {
            return json({ error: 'Valid email is required' }, { status: 400 });
        }

        // Check if already subscribed
        const existing = db.select().from(schema.subscribers).where(sql`${schema.subscribers.email} = ${email}`).get();
        if (existing) {
            return json({ error: 'You are already subscribed!' }, { status: 400 });
        }

        db.insert(schema.subscribers)
            .values({ email })
            .run();

        return json({ success: true });
    } catch (e) {
        console.error('Subscription error:', e);
        return json({ error: 'Failed to subscribe' }, { status: 500 });
    }
}
