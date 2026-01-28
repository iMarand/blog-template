import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import bcrypt from 'bcryptjs';

const dbPath = process.env.DATABASE_PATH || './data/blog.db';

// Ensure data directory exists
const dbDir = dirname(dbPath);
if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true });
}

// Create SQLite connection
const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

// Create tables if they don't exist
function createTables() {
    // Create users table (replaces admins)
    sqlite.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            email TEXT UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'author',
            display_name TEXT,
            bio TEXT,
            avatar_url TEXT,
            active INTEGER DEFAULT 1,
            created_at INTEGER DEFAULT (unixepoch()),
            updated_at INTEGER DEFAULT (unixepoch())
        );
    `);

    // Create password reset tokens table
    sqlite.exec(`
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token TEXT NOT NULL UNIQUE,
            expires_at INTEGER NOT NULL,
            created_at INTEGER DEFAULT (unixepoch()),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `);

    // Create invite tokens table
    sqlite.exec(`
        CREATE TABLE IF NOT EXISTS invite_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT,
            token TEXT NOT NULL UNIQUE,
            created_by INTEGER,
            used_at INTEGER,
            expires_at INTEGER NOT NULL,
            created_at INTEGER DEFAULT (unixepoch()),
            FOREIGN KEY (created_by) REFERENCES users(id)
        );
    `);

    // Create categories table
    sqlite.exec(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            description TEXT,
            color TEXT DEFAULT '#3b82f6',
            created_at INTEGER DEFAULT (unixepoch())
        );
    `);

    // Create posts table with author_id and content
    sqlite.exec(`
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            content TEXT,
            category_id INTEGER,
            author_id INTEGER,
            excerpt TEXT,
            featured_image TEXT,
            is_featured INTEGER DEFAULT 0,
            is_exclusive INTEGER DEFAULT 0,
            published INTEGER DEFAULT 0,
            published_at INTEGER,
            in_sitemap INTEGER DEFAULT 1,
            created_at INTEGER DEFAULT (unixepoch()),
            updated_at INTEGER DEFAULT (unixepoch()),
            FOREIGN KEY (category_id) REFERENCES categories(id),
            FOREIGN KEY (author_id) REFERENCES users(id)
        );
    `);

    // Create images table
    sqlite.exec(`
        CREATE TABLE IF NOT EXISTS images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            alt TEXT,
            path TEXT NOT NULL,
            uploaded_at INTEGER DEFAULT (unixepoch())
        );
    `);

    // Create post_categories table (Many-to-Many)
    sqlite.exec(`
        CREATE TABLE IF NOT EXISTS post_categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER NOT NULL,
            category_id INTEGER NOT NULL,
            FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
        );
    `);

    // Create post_tags table
    sqlite.exec(`
        CREATE TABLE IF NOT EXISTS post_tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER NOT NULL,
            tag TEXT NOT NULL,
            FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
        );
    `);

    // Create settings table
    sqlite.exec(`
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at INTEGER DEFAULT (unixepoch())
        );
    `);

    // Create subscribers table
    sqlite.exec(`
        CREATE TABLE IF NOT EXISTS subscribers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            created_at INTEGER DEFAULT (unixepoch())
        );
    `);

    // Create page_views table
    sqlite.exec(`
        CREATE TABLE IF NOT EXISTS page_views (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER,
            slug TEXT NOT NULL UNIQUE,
            views INTEGER DEFAULT 0,
            updated_at INTEGER DEFAULT (unixepoch()),
            FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
        );
    `);

    // Create comments table
    sqlite.exec(`
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER NOT NULL,
            author_name TEXT NOT NULL,
            author_email TEXT,
            content TEXT NOT NULL,
            approved INTEGER DEFAULT 1,
            created_at INTEGER DEFAULT (unixepoch()),
            FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
        );
    `);

    // Migration: Add missing columns to existing tables
    try {
        const postColumns = sqlite.prepare("PRAGMA table_info(posts)").all();
        const hasContent = postColumns.some(col => col.name === 'content');
        if (!hasContent) {
            sqlite.exec('ALTER TABLE posts ADD COLUMN content TEXT');
            console.log('✅ Added content column to posts table');
        }

        const hasAuthorId = postColumns.some(col => col.name === 'author_id');
        if (!hasAuthorId) {
            sqlite.exec('ALTER TABLE posts ADD COLUMN author_id INTEGER REFERENCES users(id)');
            console.log('✅ Added author_id column to posts table');
        }

        const hasInSitemap = postColumns.some(col => col.name === 'in_sitemap');
        if (!hasInSitemap) {
            sqlite.exec('ALTER TABLE posts ADD COLUMN in_sitemap INTEGER DEFAULT 1');
            console.log('✅ Added in_sitemap column to posts table');
        }
    } catch (e) {
        console.log('Migration check:', e.message);
    }

    // Create pages table
    sqlite.exec(`
        CREATE TABLE IF NOT EXISTS pages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            content TEXT,
            external_url TEXT,
            published INTEGER DEFAULT 0,
            in_sitemap INTEGER DEFAULT 1,
            created_at INTEGER DEFAULT (unixepoch()),
            updated_at INTEGER DEFAULT (unixepoch())
        );
    `);

    // Migrate old admins table data if exists
    try {
        const oldAdmins = sqlite.prepare('SELECT * FROM admins').all();
        if (oldAdmins.length > 0) {
            for (const admin of oldAdmins) {
                const exists = sqlite.prepare('SELECT id FROM users WHERE username = ?').get(admin.username);
                if (!exists) {
                    sqlite.prepare(`
                        INSERT INTO users (username, password_hash, role, created_at)
                        VALUES (?, ?, 'admin', ?)
                    `).run(admin.username, admin.password_hash, admin.created_at);
                }
            }
            console.log('✅ Migrated admin users from old admins table');
        }
    } catch (e) {
        // Old admins table doesn't exist, that's fine
    }

    // Seed default settings
    try {
        const blogNameCheck = sqlite.prepare("SELECT * FROM settings WHERE key = 'blog_name'").get();
        if (!blogNameCheck) {
            sqlite.prepare("INSERT INTO settings (key, value) VALUES ('blog_name', 'NewsWeek')").run();
            console.log('✅ Default blog name set to NewsWeek');
        }
    } catch (e) {
        console.error('Error seeding default settings:', e.message);
    }

    console.log('✅ Database tables created/verified');
}

// Create Drizzle ORM instance
export const db = drizzle(sqlite, { schema });

// Initialize database
export async function initializeDatabase() {
    try {
        createTables();

        // Check if any admin user exists
        const adminCheck = sqlite.prepare("SELECT * FROM users WHERE role = 'admin'").all();

        // If no admin exists, create default admin
        if (adminCheck.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            sqlite.prepare(`
                INSERT INTO users (username, email, password_hash, role, display_name)
                VALUES (?, ?, ?, 'admin', ?)
            `).run('admin', 'admin@example.com', hashedPassword, 'Administrator');
            console.log('✅ Default admin user created (username: admin, password: admin123)');
        }

        // Create some default categories if none exist
        const catCheck = sqlite.prepare('SELECT * FROM categories').all();
        if (catCheck.length === 0) {
            const defaultCategories = [
                { name: 'Technology', slug: 'technology', color: '#3b82f6' },
                { name: 'Lifestyle', slug: 'lifestyle', color: '#10b981' },
                { name: 'Travel', slug: 'travel', color: '#f59e0b' },
                { name: 'News', slug: 'news', color: '#ef4444' }
            ];
            for (const cat of defaultCategories) {
                sqlite.prepare(`
                    INSERT INTO categories (name, slug, color)
                    VALUES (?, ?, ?)
                `).run(cat.name, cat.slug, cat.color);
            }
            console.log('✅ Default categories created');
        }

        console.log('✅ Database initialized successfully');
    } catch (error) {
        console.error('❌ Database initialization error:', error);
        throw error;
    }
}

// Run initialization
initializeDatabase();

export { schema };
