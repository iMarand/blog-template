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

export function load({ params, locals }) {
    const postId = parseInt(params.id);

    const post = db
        .select({
            post: schema.posts,
            categoryName: schema.categories.name
        })
        .from(schema.posts)
        .leftJoin(schema.categories, eq(schema.posts.categoryId, schema.categories.id))
        .where(eq(schema.posts.id, postId))
        .get();

    if (!post) {
        throw error(404, 'Post not found');
    }

    // Authors can only edit their own posts
    if (locals.user.role === 'author' && post.post.authorId !== locals.user.id) {
        throw error(403, 'You can only edit your own posts');
    }

    // Read content from filesystem
    const fsContent = readMarkdownFile(post.post.slug);

    if (fsContent === null) {
        console.warn(`[Admin] Content file for slug "${post.slug}" not found.`);
        post.content = '';
    } else {
        post.content = fsContent;
    }

    const categories = db.select().from(schema.categories).all();

    return {
        post: {
            ...post.post,
            categoryLabel: post.categoryName || '',
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
        const categoryLabel = data.get('categoryLabel')?.toString().trim();
        const excerpt = data.get('excerpt')?.toString().trim() || '';
        let featuredImage = data.get('featuredImage')?.toString().trim() || '';
        const featuredImageFile = data.get('featuredImageFile');
        const action = data.get('action')?.toString();

        // Verify ownership for authors
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
                // Delete old image if it was and internal upload
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
            return fail(400, { error: 'Title is required', title, content, categoryLabel, excerpt, featuredImage });
        }

        const categoryId = getOrCreateCategory(categoryLabel);
        let slug = existingPost.slug;

        // Automatically regenerate slug if title changed significantly or user wants new slug logic?
        // User said: "if it senses slug will be same as post in db must include a random number to be different"
        // This usually applies to NEW posts or title changes.
        if (existingPost.title !== title) {
            slug = generateUniqueSlug(title, postId);
        }

        // Unique slug handled above

        // Handle filesystem changes
        try {
            if (existingPost.slug !== slug) {
                // Slug changed, rename file
                renameMarkdownFile(existingPost.slug, slug);
            }
            // Update content in file
            writeMarkdownFile(slug, content);
        } catch (e) {
            console.error('Filesystem error:', e);
            return fail(500, { error: 'Failed to update post content on disk', title, slug, content, categoryId, excerpt, featuredImage });
        }

        let published = existingPost.published;
        let publishedAt = existingPost.publishedAt;
        const inSitemap = data.get('inSitemap') === 'true';

        if (action === 'publish') {
            published = true;
            publishedAt = publishedAt || new Date();
        } else if (action === 'unpublish') {
            published = false;
        }

        // Update the post metadata
        db.update(schema.posts)
            .set({
                title,
                slug,
                content: '', // Content is in FS
                categoryId: categoryId ? parseInt(categoryId) : null,
                excerpt: excerpt || null,
                featuredImage: featuredImage || null,
                published,
                publishedAt,
                inSitemap,
                updatedAt: new Date()
            })
            .where(eq(schema.posts.id, postId))
            .run();

        return { success: true };
    },

    delete: async ({ params, locals }) => {
        const postId = parseInt(params.id);

        const post = db
            .select()
            .from(schema.posts)
            .where(eq(schema.posts.id, postId))
            .get();

        if (!post) {
            throw error(404, 'Post not found');
        }

        // Authors can only delete their own posts
        if (locals.user.role === 'author' && post.authorId !== locals.user.id) {
            throw error(403, 'You can only delete your own posts');
        }

        // Delete from filesystem
        try {
            deleteMarkdownFile(post.slug);
            // Delete featured image if internal
            if (post.featuredImage && post.featuredImage.startsWith('/api/uploads/')) {
                const filename = post.featuredImage.split('/').pop();
                deleteUpload(filename);
            }
        } catch (e) {
            console.error('Failed to delete markdown file or image:', e);
            // Continue to delete from DB even if FS fails (orphaned file is better than broken DB)
        }

        db.delete(schema.posts).where(eq(schema.posts.id, postId)).run();

        throw redirect(303, '/admin/posts');
    }
};
