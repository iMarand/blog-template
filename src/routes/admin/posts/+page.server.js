import { db, schema } from '$lib/server/db/index.js';
import { eq, desc } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export function load({ locals }) {
    const user = locals.user;

    // Get posts with category and author info
    let postsQuery = db
        .select({
            id: schema.posts.id,
            title: schema.posts.title,
            slug: schema.posts.slug,
            published: schema.posts.published,
            createdAt: schema.posts.createdAt,
            categoryId: schema.posts.categoryId,
            authorId: schema.posts.authorId
        })
        .from(schema.posts)
        .orderBy(desc(schema.posts.createdAt));

    // Authors can only see their own posts
    if (user.role === 'author') {
        postsQuery = db
            .select({
                id: schema.posts.id,
                title: schema.posts.title,
                slug: schema.posts.slug,
                published: schema.posts.published,
                createdAt: schema.posts.createdAt,
                categoryId: schema.posts.categoryId,
                authorId: schema.posts.authorId
            })
            .from(schema.posts)
            .where(eq(schema.posts.authorId, user.id))
            .orderBy(desc(schema.posts.createdAt));
    }

    const posts = postsQuery.all().map(post => {
        const category = post.categoryId
            ? db.select().from(schema.categories).where(eq(schema.categories.id, post.categoryId)).get()
            : null;

        const author = post.authorId
            ? db.select().from(schema.users).where(eq(schema.users.id, post.authorId)).get()
            : null;

        return {
            ...post,
            categoryName: category?.name || null,
            categoryColor: category?.color || '#3b82f6',
            authorName: author?.displayName || author?.username || null
        };
    });

    return {
        posts,
        user
    };
}

export const actions = {
    delete: async ({ request, locals }) => {
        const data = await request.formData();
        const postId = parseInt(data.get('postId')?.toString() || '0');

        if (!postId) {
            return fail(400, { error: 'Invalid post ID' });
        }

        // Get the post to check ownership
        const post = db
            .select()
            .from(schema.posts)
            .where(eq(schema.posts.id, postId))
            .get();

        if (!post) {
            return fail(404, { error: 'Post not found' });
        }

        // Authors can only delete their own posts
        if (locals.user.role === 'author' && post.authorId !== locals.user.id) {
            return fail(403, { error: 'You can only delete your own posts' });
        }

        // Delete the post
        db.delete(schema.posts).where(eq(schema.posts.id, postId)).run();

        return { success: true };
    },

    sendNewsletter: async ({ request, locals }) => {
        // Only admin can send newsletters
        if (locals.user.role !== 'admin') {
            return fail(403, { error: 'Unauthorized' });
        }

        const formData = await request.formData();
        const postId = parseInt(formData.get('postId')?.toString() || '0');

        if (!postId) {
            return fail(400, { error: 'Invalid post ID' });
        }

        const post = db.select().from(schema.posts).where(eq(schema.posts.id, postId)).get();
        if (!post) {
            return fail(404, { error: 'Post not found' });
        }

        if (!post.published) {
            return fail(400, { error: 'Post must be published to send newsletter' });
        }

        const subscribers = db.select().from(schema.subscribers).all();
        if (subscribers.length === 0) {
            return fail(400, { error: 'No subscribers found' });
        }

        const { sendNewsletter } = await import('$lib/server/mailer.js');

        // Fetch blog name for the email
        const blogNameSetting = db.select().from(schema.settings).where(eq(schema.settings.key, 'blog_name')).get();
        const blogName = blogNameSetting?.value || 'Our Blog';

        const subject = `[${blogName}] New Article: ${post.title}`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
                <h1 style="color: #333; font-size: 24px;">${post.title}</h1>
                <p style="color: #666; font-size: 16px;">${post.excerpt || 'Checkout our latest article!'}</p>
                <div style="margin: 30px 0;">
                    <a href="${process.env.PUBLIC_URL || 'http://localhost:5173'}/blog/${post.slug}" 
                       style="background-color: #e31e24; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                        READ ARTICLE
                    </a>
                </div>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="color: #999; font-size: 12px; text-align: center;">
                    You are receiving this because you subscribed to ${blogName}.
                </p>
            </div>
        `;

        let successCount = 0;
        let failCount = 0;

        // In a real app, you might want to use a queue or batch sending
        for (const sub of subscribers) {
            const result = await sendNewsletter(sub.email, subject, html);
            if (result.success) successCount++;
            else failCount++;
        }

        return {
            newsletterSuccess: true,
            message: `Sent to ${successCount} subscribers. ${failCount > 0 ? `Failed: ${failCount}` : ''}`
        };
    }
};
