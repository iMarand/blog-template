import { db, schema } from '$lib/server/db/index.js';
import { readMarkdownFile, writeMarkdownFile, renameMarkdownFile, deleteMarkdownFile, saveUpload, deleteUpload } from '$lib/server/storage/filesystem.js';
import { redirect, fail, error } from '@sveltejs/kit';
import { eq, and, ne } from 'drizzle-orm';

// Helper to generate unique slug for existing post
function generateUniqueSlug(title, excludeId) {
    let slug = title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    // Check if slug exists in OTHER posts
    const exists = db.select().from(schema.posts)
        .where(and(eq(schema.posts.slug, slug), ne(schema.posts.id, excludeId)))
        .get();

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

export function load({ params, locals }) {
    const postId = parseInt(params.id);

    const post = db
        .select()
        .from(schema.posts)
        .where(eq(schema.posts.id, postId))
        .get();

    if (!post) {
        throw error(404, 'Post not found');
    }

    // Authors can only edit their own posts
    if (locals.user.role === 'author' && post.authorId !== locals.user.id) {
        throw error(403, 'You can only edit your own posts');
    }

    // Fetch categories for this post
    let postCats = db
        .select({
            name: schema.categories.name
        })
        .from(schema.postCategories)
        .innerJoin(schema.categories, eq(schema.postCategories.categoryId, schema.categories.id))
        .where(eq(schema.postCategories.postId, postId))
        .all();

    // Fallback: Check direct categoryId on the post if no many-to-many records exist
    if (postCats.length === 0 && post.categoryId) {
        const primaryCat = db
            .select({ name: schema.categories.name })
            .from(schema.categories)
            .where(eq(schema.categories.id, post.categoryId))
            .get();

        if (primaryCat) {
            postCats = [primaryCat];
        }
    }

    let categoryLabel = postCats.map(c => c.name).join(', ');
    if (post.isExclusive) {
        // Avoid duplicating "Exclusive" if it's already a category
        const labels = new Set(postCats.map(c => c.name));
        if (!labels.has('Exclusive')) {
            categoryLabel = categoryLabel ? `${categoryLabel}, Exclusive` : 'Exclusive';
        }
    }

    // Read content from filesystem
    const fsContent = readMarkdownFile(post.slug);

    const categories = db.select().from(schema.categories).all();

    return {
        post: {
            ...post,
            categoryLabel,
            content: fsContent || ''
        },
        categories
    };
}

export const actions = {
    update: async ({ request, params, locals }) => {
        const postId = parseInt(params.id);
        const data = await request.formData();

        const title = data.get('title')?.toString().trim();
        const content = data.get('content')?.toString() || '';
        const categoryLabelString = data.get('categoryLabel')?.toString().trim() || '';
        const excerpt = data.get('excerpt')?.toString().trim() || '';
        let featuredImage = data.get('featuredImage')?.toString().trim() || '';
        const featuredImageFile = data.get('featuredImageFile');
        const action = data.get('action')?.toString();

        const existingPost = db
            .select()
            .from(schema.posts)
            .where(eq(schema.posts.id, postId))
            .get();

        if (!existingPost) {
            throw error(404, 'Post not found');
        }

        if (locals.user.role === 'author' && existingPost.authorId !== locals.user.id) {
            throw error(403, 'You can only edit your own posts');
        }

        if (featuredImageFile && featuredImageFile instanceof File && featuredImageFile.size > 0) {
            try {
                if (existingPost.featuredImage && existingPost.featuredImage.startsWith('/api/uploads/')) {
                    const oldFilename = existingPost.featuredImage.split('/').pop();
                    deleteUpload(oldFilename);
                }
                const filename = await saveUpload(featuredImageFile);
                featuredImage = `/api/uploads/${filename}`;
            } catch (e) {
                console.error('Failed to upload featured image:', e);
            }
        }

        if (!title) {
            return fail(400, { error: 'Title is required', title, content, categoryLabel: categoryLabelString, excerpt, featuredImage });
        }

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

        const categoryIds = finalLabels.map(l => getOrCreateCategory(l)).filter(id => id !== null);
        const primaryCategoryId = categoryIds.length > 0 ? categoryIds[0] : null;

        let slug = existingPost.slug;
        if (existingPost.title !== title) {
            slug = generateUniqueSlug(title, postId);
        }

        try {
            if (existingPost.slug !== slug) {
                renameMarkdownFile(existingPost.slug, slug);
            }
            writeMarkdownFile(slug, content);
        } catch (e) {
            console.error('Filesystem error:', e);
            return fail(500, { error: 'Failed to update post content on disk', title, slug, content, categoryId: primaryCategoryId, excerpt, featuredImage });
        }

        let published = existingPost.published;
        let publishedAt = existingPost.publishedAt;
        const inSitemap = data.get('inSitemap') === 'true';
        const isFeatured = data.get('isFeatured') === 'true';

        if (action === 'publish') {
            published = true;
            publishedAt = publishedAt || new Date();
        } else if (action === 'unpublish') {
            published = false;
        }

        // 1. Update Post metadata
        db.update(schema.posts)
            .set({
                title,
                slug,
                content: '',
                categoryId: primaryCategoryId,
                excerpt: excerpt || null,
                featuredImage: featuredImage || null,
                isFeatured,
                isExclusive,
                published,
                publishedAt,
                inSitemap,
                updatedAt: new Date()
            })
            .where(eq(schema.posts.id, postId))
            .run();

        // 2. Sync categories in junction table
        db.delete(schema.postCategories).where(eq(schema.postCategories.postId, postId)).run();
        if (categoryIds.length > 0) {
            for (const catId of categoryIds) {
                db.insert(schema.postCategories).values({
                    postId,
                    categoryId: catId
                }).run();
            }
        }

        return { success: true };
    },

    delete: async ({ params, locals }) => {
        const postId = parseInt(params.id);
        const post = db.select().from(schema.posts).where(eq(schema.posts.id, postId)).get();

        if (!post) throw error(404, 'Post not found');
        if (locals.user.role === 'author' && post.authorId !== locals.user.id) throw error(403, 'Forbidden');

        try {
            deleteMarkdownFile(post.slug);
            if (post.featuredImage && post.featuredImage.startsWith('/api/uploads/')) {
                const filename = post.featuredImage.split('/').pop();
                deleteUpload(filename);
            }
        } catch (e) {
            console.error(e);
        }

        db.delete(schema.posts).where(eq(schema.posts.id, postId)).run();
        throw redirect(303, '/admin/posts');
    }
};
