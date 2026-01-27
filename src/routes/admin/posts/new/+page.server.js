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
function getOrCreateCategory(name) {
    if (!name) return null;
    const cleanName = name.trim();
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    let category = db.select().from(schema.categories).where(eq(schema.categories.name, cleanName)).get();

    if (!category) {
        // Try slug match
        category = db.select().from(schema.categories).where(eq(schema.categories.slug, slug)).get();
    }

    if (!category) {
        const result = db.insert(schema.categories).values({
            name: cleanName,
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
        const categoryLabelString = data.get('categoryLabel')?.toString().trim() || '';
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
            return fail(400, { error: 'Title is required', title, content, categoryLabel: categoryLabelString, excerpt, featuredImage });
        }

        const slug = generateUniqueSlug(title);

        // --- Multi-Category & Exclusive Logic ---
        const rawLabels = categoryLabelString.split(',').map(l => l.trim()).filter(l => l !== '');
        let isExclusive = false;
        const finalLabels = [];

        for (const label of rawLabels) {
            if (label.toLowerCase() === 'exclusive') {
                isExclusive = true;
            } else {
                finalLabels.push(label);
            }
        }

        // Get IDs for valid categories
        const categoryIds = finalLabels.map(l => getOrCreateCategory(l)).filter(id => id !== null);
        const primaryCategoryId = categoryIds.length > 0 ? categoryIds[0] : null;

        // Save content to filesystem
        try {
            writeMarkdownFile(slug, content);
        } catch (e) {
            console.error('Failed to write markdown file:', e);
            return fail(500, { error: 'Failed to save post content', title, slug, content, categoryId: primaryCategoryId, excerpt, featuredImage });
        }

        const isPublish = action === 'publish';
        const inSitemap = data.get('inSitemap') === 'true';
        const isFeatured = data.get('isFeatured') === 'true';

        // 1. Create the post metadata in DB
        const result = db.insert(schema.posts).values({
            title,
            slug,
            categoryId: primaryCategoryId, // Still keep primary for easy joining
            authorId: locals.user.id,
            excerpt: excerpt || null,
            featuredImage: featuredImage || null,
            isFeatured,
            isExclusive, // New flag
            published: isPublish,
            publishedAt: isPublish ? new Date() : null,
            inSitemap
        }).run();

        const postId = Number(result.lastInsertRowid);

        // 2. Insert into junction table
        if (categoryIds.length > 0) {
            for (const catId of categoryIds) {
                db.insert(schema.postCategories).values({
                    postId,
                    categoryId: catId
                }).run();
            }
        }

        throw redirect(303, '/admin/posts');
    }
};
