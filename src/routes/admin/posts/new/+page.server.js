import { db, schema } from '$lib/server/db/index.js';
import { writeMarkdownFile, saveUpload } from '$lib/server/storage/filesystem.js';
import { redirect, fail } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';

// Helper to generate unique slug
function generateUniqueSlug(title) {
    let slug = title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    // Check if slug exists
    const exists = db.select().from(schema.posts).where(eq(schema.posts.slug, slug)).get();
    if (exists) {
        const random = Math.floor(1000 + Math.random() * 9000);
        slug = `${slug}-${random}`;
    }
    return slug;
}

// Helper to get or create category by name/label
function getOrCreateCategory(label) {
    if (!label) return null;
    const name = label.trim();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    let category = db.select().from(schema.categories).where(eq(schema.categories.name, name)).get();

    if (!category) {
        // Try slug match
        category = db.select().from(schema.categories).where(eq(schema.categories.slug, slug)).get();
    }

    if (!category) {
        const result = db.insert(schema.categories).values({
            name,
            slug,
            color: '#3b82f6'
        }).run();
        return Number(result.lastInsertRowid);
    }

    return category.id;
}

export function load() {
    const categories = db.select().from(schema.categories).all();
    return { categories };
}

export const actions = {
    default: async ({ request, locals }) => {
        const data = await request.formData();
        const title = data.get('title')?.toString().trim();
        const content = data.get('content')?.toString() || '';
        const categoryLabel = data.get('categoryLabel')?.toString().trim();
        const excerpt = data.get('excerpt')?.toString().trim() || '';
        let featuredImage = data.get('featuredImage')?.toString().trim() || '';
        const featuredImageFile = data.get('featuredImageFile');
        const action = data.get('action')?.toString();

        if (featuredImageFile && featuredImageFile instanceof File && featuredImageFile.size > 0) {
            try {
                const filename = await saveUpload(featuredImageFile);
                featuredImage = `/api/uploads/${filename}`;
            } catch (e) {
                console.error('Failed to upload featured image:', e);
            }
        }

        if (!title) {
            return fail(400, { error: 'Title is required', title, content, categoryLabel, excerpt, featuredImage });
        }

        const slug = generateUniqueSlug(title);
        const categoryId = getOrCreateCategory(categoryLabel);

        // No manual slug collision check needed now, handled by generateUniqueSlug

        // Save content to filesystem
        try {
            writeMarkdownFile(slug, content);
        } catch (e) {
            console.error('Failed to write markdown file:', e);
            return fail(500, { error: 'Failed to save post content', title, slug, content, categoryId, excerpt, featuredImage });
        }

        const isPublish = action === 'publish';
        const inSitemap = data.get('inSitemap') === 'true';

        // Create the post metadata in DB (content is stored in FS)
        db.insert(schema.posts).values({
            title,
            slug,
            categoryId,
            authorId: locals.user.id,
            excerpt: excerpt || null,
            featuredImage: featuredImage || null,
            published: isPublish,
            publishedAt: isPublish ? new Date() : null,
            inSitemap
        }).run();

        throw redirect(303, '/admin/posts');
    }
};
