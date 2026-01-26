import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users table (supports admin and author roles)
export const users = sqliteTable('users', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    username: text('username').notNull().unique(),
    email: text('email').unique(),
    passwordHash: text('password_hash').notNull(),
    role: text('role').notNull().default('author'), // 'admin' or 'author'
    displayName: text('display_name'),
    active: integer('active', { mode: 'boolean' }).default(true),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`)
});

// Password reset tokens
export const passwordResetTokens = sqliteTable('password_reset_tokens', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    token: text('token').notNull().unique(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`)
});

// Invite tokens for authors
export const inviteTokens = sqliteTable('invite_tokens', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    email: text('email'),
    token: text('token').notNull().unique(),
    createdBy: integer('created_by').references(() => users.id),
    usedAt: integer('used_at', { mode: 'timestamp' }),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`)
});

// Categories table
export const categories = sqliteTable('categories', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    color: text('color').default('#3b82f6'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`)
});

// Posts metadata table
export const posts = sqliteTable('posts', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    content: text('content'), // Restored for site-wide search functionality
    categoryId: integer('category_id').references(() => categories.id),
    authorId: integer('author_id').references(() => users.id),
    excerpt: text('excerpt'),
    featuredImage: text('featured_image'),
    published: integer('published', { mode: 'boolean' }).default(false),
    publishedAt: integer('published_at', { mode: 'timestamp' }),
    inSitemap: integer('in_sitemap', { mode: 'boolean' }).default(true),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`)
});

// Pages table for static content
export const pages = sqliteTable('pages', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    content: text('content').notNull(),
    published: integer('published', { mode: 'boolean' }).default(false),
    inSitemap: integer('in_sitemap', { mode: 'boolean' }).default(true),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`)
});

// Images table
export const images = sqliteTable('images', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    filename: text('filename').notNull(),
    alt: text('alt'),
    path: text('path').notNull(),
    uploadedAt: integer('uploaded_at', { mode: 'timestamp' }).default(sql`(unixepoch())`)
});

// Post tags table
export const postTags = sqliteTable('post_tags', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    postId: integer('post_id')
        .references(() => posts.id, { onDelete: 'cascade' })
        .notNull(),
    tag: text('tag').notNull()
});

// Settings table for global configuration
export const settings = sqliteTable('settings', {
    key: text('key').primaryKey(),
    value: text('value').notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`)
});

// Subscribers table
export const subscribers = sqliteTable('subscribers', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    email: text('email').notNull().unique(),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`)
});

// Keep admins export for backward compatibility during migration
export const admins = users;
