import Database from 'better-sqlite3';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = './data/blog.db'; // Assuming run from root

const db = new Database(dbPath);

console.log('Starting migration...');

// 1. Get all categories
const categories = db.prepare('SELECT * FROM categories').all();

const categoriesToDelete = new Set();
// Cache for new/clean categories to avoid lookup spam
const categoryCache = new Map(); // name -> id

function getOrCreateCategory(name) {
    const cleanName = name.trim();
    if (categoryCache.has(cleanName)) return categoryCache.get(cleanName);

    // Check DB
    let cat = db.prepare('SELECT id FROM categories WHERE name = ?').get(cleanName);
    if (!cat) {
        // Create
        const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const info = db.prepare('INSERT INTO categories (name, slug, color) VALUES (?, ?, ?)')
            .run(cleanName, slug, '#3b82f6');
        cat = { id: info.lastInsertRowid };
        console.log(`Created new category: ${cleanName}`);
    }
    categoryCache.set(cleanName, cat.id);
    return cat.id;
}


// Transaction for safety
const migrate = db.transaction(() => {
    for (const cat of categories) {
        // Check if this category needs splitting or is just "Exclusive"
        const name = cat.name;

        // Condition: Has comma OR is exactly "Exclusive" (case insensitive)
        if (name.includes(',') || name.toLowerCase().trim() === 'exclusive') {
            console.log(`Processing category: "${name}" (ID: ${cat.id})`);

            // Get all posts associated with this category ID directly
            const posts = db.prepare('SELECT id, title FROM posts WHERE category_id = ?').all(cat.id);

            if (posts.length > 0) {
                // Parse labels
                const parts = name.split(',').map(s => s.trim()).filter(s => s);
                let isExclusive = false;
                const newCategoryIds = [];

                for (const part of parts) {
                    if (part.toLowerCase() === 'exclusive') {
                        isExclusive = true;
                    } else {
                        const newId = getOrCreateCategory(part);
                        newCategoryIds.push(newId);
                    }
                }

                // Update each post
                for (const post of posts) {
                    // Update is_exclusive flag if needed
                    if (isExclusive) {
                        db.prepare('UPDATE posts SET is_exclusive = 1 WHERE id = ?').run(post.id);
                        console.log(`  Set Exclusive: "${post.title}"`);
                    }

                    // Assign new links
                    // 1. Update primary category_id to the first valid one, or null if only "Exclusive"
                    const primaryId = newCategoryIds.length > 0 ? newCategoryIds[0] : null; // Start with null
                    // If primaryId is null, we might want to leave it or set to a default 'General'? 
                    // schema allows null? references categories(id). 
                    // Let's assume if it was ONLY "Exclusive", it might have no category now.

                    db.prepare('UPDATE posts SET category_id = ? WHERE id = ?').run(primaryId, post.id);

                    // 2. Insert into post_categories
                    // First clear existing for this post to be safe (though we didn't have any before usually or handled by logic)
                    db.prepare('DELETE FROM post_categories WHERE post_id = ?').run(post.id);

                    for (const cid of newCategoryIds) {
                        db.prepare('INSERT OR IGNORE INTO post_categories (post_id, category_id) VALUES (?, ?)').run(post.id, cid);
                    }
                }
            }

            // Mark old category for deletion
            categoriesToDelete.add(cat.id);
        }
    }

    // Delete the old "messy" categories
    for (const id of categoriesToDelete) {
        // Only delete if we are sure we moved everyone. 
        // We know we updated all posts with `category_id = ?` WHERE category_id was this id.
        // So safe to delete.
        db.prepare('DELETE FROM categories WHERE id = ?').run(id);
        console.log(`Deleted old category ID: ${id}`);
    }
});

try {
    migrate();
    console.log('Migration successful!');
} catch (e) {
    console.error('Migration failed:', e);
}

db.close();
