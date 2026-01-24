import { json } from '@sveltejs/kit';
import { db, schema } from '$lib/server/db/index.js';
import { readMarkdownFile, writeMarkdownFile } from '$lib/server/storage/filesystem.js';

export async function GET() {
    const posts = db.select().from(schema.posts).all();
    let migratedCount = 0;
    let skippedCount = 0;
    let errors = [];

    for (const post of posts) {
        try {
            const existingFile = readMarkdownFile(post.slug);
            if (existingFile === null) {
                // File missing, write DB content or empty string
                const contentToWrite = post.content || '';
                writeMarkdownFile(post.slug, contentToWrite);
                migratedCount++;
            } else {
                skippedCount++;
            }
        } catch (e) {
            errors.push({ slug: post.slug, error: e.message });
        }
    }

    return json({
        success: true,
        total: posts.length,
        migrated: migratedCount,
        skipped: skippedCount,
        errors
    });
}
