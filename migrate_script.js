import { db, schema } from './src/lib/server/db/index.js';
import { readMarkdownFile, writeMarkdownFile } from './src/lib/server/storage/filesystem.js';

console.log('Starting migration...');

try {
    const posts = db.select().from(schema.posts).all();
    console.log(`Found ${posts.length} posts in database.`);
    let migratedCount = 0;
    let skippedCount = 0;

    for (const post of posts) {
        // Mocking checks similar to the server route
        const existingFile = readMarkdownFile(post.slug);

        if (existingFile === null) {
            console.log(`Migrating post: ${post.slug}`);
            const contentToWrite = post.content || '';
            writeMarkdownFile(post.slug, contentToWrite);
            migratedCount++;
        } else {
            skippedCount++;
        }
    }

    console.log(`Migration complete.`);
    console.log(`Migrated: ${migratedCount}`);
    console.log(`Skipped (already exists): ${skippedCount}`);

} catch (e) {
    console.error('Migration failed:', e);
}
