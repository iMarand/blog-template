import { db, schema } from './src/lib/server/db/index.js';
import { eq, desc } from 'drizzle-orm';

async function diagnose() {
    console.log('--- DATABASE DIAGNOSTICS ---');

    // 1. List all categories
    const allCategories = db.select().from(schema.categories).all();
    console.log('\nCATEGORIES:');
    allCategories.forEach(c => {
        console.log(`- ID: ${c.id}, Name: "${c.name}", Slug: "${c.slug}"`);
    });

    // 2. List recent posts
    const recentPosts = db.select({
        id: schema.posts.id,
        title: schema.posts.title,
        slug: schema.posts.slug,
        categoryId: schema.posts.categoryId,
        published: schema.posts.published,
        publishedAt: schema.posts.publishedAt
    })
        .from(schema.posts)
        .orderBy(desc(schema.posts.id))
        .limit(10)
        .all();

    console.log('\nRECENT POSTS:');
    recentPosts.forEach(p => {
        const cat = allCategories.find(c => c.id === p.categoryId);
        console.log(`- ID: ${p.id}, Title: "${p.title}", Cat: "${cat ? cat.name : 'NONE'}" (ID: ${p.categoryId}), Published: ${p.published} (${typeof p.published}), PublishedAt: ${p.publishedAt}`);
    });

    process.exit(0);
}

diagnose().catch(err => {
    console.error('Diagnostics failed:', err);
    process.exit(1);
});
