import { db, schema } from './src/lib/server/db/index.js';
import { writeMarkdownFile } from './src/lib/server/storage/filesystem.js';
import { eq } from 'drizzle-orm';

const CATEGORIES = [
    { name: 'Technology', slug: 'technology', color: '#3b82f6', description: 'Latest tech news and gadget reviews.' },
    { name: 'Lifestyle', slug: 'lifestyle', color: '#10b981', description: 'Health, wellness, and everyday living.' },
    { name: 'Travel', slug: 'travel', color: '#f59e0b', description: 'Explore the world with our travel guides.' },
    { name: 'Food', slug: 'food', color: '#ef4444', description: 'Recipes, restaurant reviews, and food trends.' },
    { name: 'Health', slug: 'health', color: '#8b5cf6', description: 'Stay fit and healthy with our expert advice.' },
    { name: 'Business', slug: 'business', color: '#6366f1', description: 'Insights into the world of business and finance.' },
    { name: 'Entertainment', slug: 'entertainment', color: '#ec4899', description: 'Movies, music, celebrity news, and more.' },
    { name: 'Education', slug: 'education', color: '#14b8a6', description: 'Resources and tips for students and lifelong learners.' }
];

const ADJECTIVES = ['Future of', 'Ultimate Guide to', 'Secret to', 'How to Master', 'Trends in', 'Impact of', 'Innovations in', 'Basics of'];
const SUBJECTS = ['Web Development', 'Minimalist Design', 'Global Destinations', 'Sustainable Cooking', 'Mental Wellness', 'Remote Work', 'Digital Marketing', 'Creative Writing', 'Sustainable Energy', 'Modern Architecture', 'Healthy Habits', 'Financial Literacy', 'Artificial Intelligence', 'Space Exploration', 'Quantum Computing', 'Marine Biology'];

async function seed() {
    console.log('🌱 Starting demo data seeding...');

    // 1. Ensure Categories exist
    const categoryMap = new Map();
    for (const cat of CATEGORIES) {
        let existing = db.select().from(schema.categories).where(eq(schema.categories.slug, cat.slug)).get();
        if (!existing) {
            const result = db.insert(schema.categories).values(cat).run();
            const id = Number(result.lastInsertRowid);
            categoryMap.set(cat.slug, id);
            console.log(`✅ Created category: ${cat.name}`);
        } else {
            categoryMap.set(cat.slug, existing.id);
            console.log(`ℹ️ Category exists: ${cat.name}`);
        }
    }

    // 2. Generate 50 Posts
    const totalPosts = 50;
    const authorId = 1; // Default admin user

    for (let i = 1; i <= totalPosts; i++) {
        // Distribute posts across categories (ensures at least 5 each if using round-robin)
        const catIndex = (i - 1) % CATEGORIES.length;
        const category = CATEGORIES[catIndex];
        const categoryId = categoryMap.get(category.slug);

        const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
        const sub = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];
        const title = `${adj} ${sub} #${i}`;
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + i;

        const content = `
# ${title}

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

## Why ${sub} Matters

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

![Featured Image](https://picsum.photos/seed/${slug}/1200/600)

### Key Takeaways

1. **Focus on Quality**: Good content is king.
2. **Consistency**: Post regularly to keep users engaged.
3. **Accessibility**: Ensure your site is usable by everyone.

> "${sub} is not just a trend, it's a fundamental shift in how we approach ${category.name.toLowerCase()}."

Stay tuned for more articles about ${category.name}!
        `.trim();

        const excerpt = `Discover the ${adj.toLowerCase()} ${sub.toLowerCase()} and how it's changing the landscape of ${category.name.toLowerCase()} in this deep dive.`;
        const featuredImage = `https://picsum.photos/seed/${slug}/1200/600`;

        // Check if post exists
        const existingPost = db.select().from(schema.posts).where(eq(schema.posts.slug, slug)).get();
        if (existingPost) {
            console.log(`ℹ️ Post exists: ${title}`);
            continue;
        }

        const publishedAt = new Date();
        publishedAt.setDate(publishedAt.getDate() - (50 - i)); // Stagger dates back in time

        // Insert into DB
        db.insert(schema.posts).values({
            title,
            slug,
            categoryId,
            authorId,
            excerpt,
            featuredImage,
            published: true,
            publishedAt,
            createdAt: publishedAt,
            updatedAt: publishedAt
        }).run();

        // Write to Filesystem
        writeMarkdownFile(slug, content);
        console.log(`📝 Generated post ${i}/50: ${title}`);
    }

    console.log('🏁 Seeding completed successfully!');
}

seed().catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
