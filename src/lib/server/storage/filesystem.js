import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, unlinkSync, renameSync } from 'fs';
import { join } from 'path';

// Configurable paths for portability
export const POSTS_DIR = process.env.POSTS_PATH || './data/posts';
export const UPLOADS_DIR = process.env.UPLOADS_PATH || './data/uploads';

// Ensure directories exist
export function ensureDirectories() {
    if (!existsSync(POSTS_DIR)) {
        mkdirSync(POSTS_DIR, { recursive: true });
        console.log(`✅ Created posts directory: ${POSTS_DIR}`);
    }
    if (!existsSync(UPLOADS_DIR)) {
        mkdirSync(UPLOADS_DIR, { recursive: true });
        console.log(`✅ Created uploads directory: ${UPLOADS_DIR}`);
    }
}

// Read a markdown file
export function readMarkdownFile(slug) {
    const filePath = join(POSTS_DIR, `${slug}.md`);
    console.log(`[Filesystem] Reading file: ${filePath}`);
    if (!existsSync(filePath)) {
        console.warn(`[Filesystem] File not found: ${filePath}`);
        return null;
    }
    const content = readFileSync(filePath, 'utf-8');
    console.log(`[Filesystem] Content length: ${content.length}`);
    return content;
}

// Write a markdown file
export function writeMarkdownFile(slug, content) {
    ensureDirectories();
    const filePath = join(POSTS_DIR, `${slug}.md`);
    writeFileSync(filePath, content, 'utf-8');
}

// Delete a markdown file
export function deleteMarkdownFile(slug) {
    const filePath = join(POSTS_DIR, `${slug}.md`);
    if (existsSync(filePath)) {
        try {
            unlinkSync(filePath);
        } catch (e) {
            console.error(`Error deleting file ${filePath}:`, e);
        }
    }
}

// Rename a markdown file
export function renameMarkdownFile(oldSlug, newSlug) {
    const oldPath = join(POSTS_DIR, `${oldSlug}.md`);
    const newPath = join(POSTS_DIR, `${newSlug}.md`);
    if (existsSync(oldPath)) {
        try {
            renameSync(oldPath, newPath);
        } catch (e) {
            console.error(`Error renaming file from ${oldSlug} to ${newSlug}:`, e);
        }
    }
}

// Parse frontmatter and content from markdown
export function parseMarkdown(markdownContent) {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = markdownContent.match(frontmatterRegex);

    if (!match) {
        return {
            frontmatter: {},
            content: markdownContent
        };
    }

    const frontmatterText = match[1];
    const content = match[2];

    // Parse frontmatter (simple key: value format)
    const frontmatter = {};
    frontmatterText.split('\n').forEach((line) => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
            const key = line.substring(0, colonIndex).trim();
            const value = line.substring(colonIndex + 1).trim();
            frontmatter[key] = value;
        }
    });

    return { frontmatter, content };
}

// Generate frontmatter string
export function generateFrontmatter(data) {
    const lines = [
        '---',
        `title: ${data.title}`,
        `date: ${data.date}`,
        `category: ${data.category}`,
        `excerpt: ${data.excerpt || ''}`,
        `featuredImage: ${data.featuredImage || ''}`,
        `tags: ${data.tags || ''}`,
        '---'
    ];
    return lines.join('\n');
}

// List all markdown files
export function listMarkdownFiles() {
    ensureDirectories();
    return readdirSync(POSTS_DIR).filter((file) => file.endsWith('.md'));
}

// Save an uploaded file to the uploads directory
export async function saveUpload(file) {
    ensureDirectories();
    const bytes = await file.arrayBuffer();
    let buffer = Buffer.from(bytes);

    // Image optimization logic
    if (file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|avif|tiff|gif)$/i.test(file.name)) {
        try {
            const sharp = (await import('sharp')).default;
            const MAX_SIZE_BYTES = 500 * 1024; // 500KB
            const MAX_WIDTH = 1920;

            // Only process if larger than limit
            if (buffer.length > MAX_SIZE_BYTES) {
                console.log(`[Upload] Optimizing large image: ${file.name} (${(buffer.length / 1024).toFixed(2)} KB)`);
                let pipeline = sharp(buffer);
                const metadata = await pipeline.metadata();

                // Resize
                if (metadata.width > MAX_WIDTH) {
                    pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
                }

                // Compress
                let outputBuffer;
                if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
                    outputBuffer = await pipeline.jpeg({ quality: 80, mozjpeg: true }).toBuffer();
                } else if (metadata.format === 'png') {
                    outputBuffer = await pipeline.png({ quality: 80, compressionLevel: 8 }).toBuffer();
                } else if (metadata.format === 'webp') {
                    outputBuffer = await pipeline.webp({ quality: 80 }).toBuffer();
                } else {
                    outputBuffer = await pipeline.toBuffer();
                }

                // If still too big, try harder
                if (outputBuffer.length > MAX_SIZE_BYTES) {
                    console.log(`[Upload] Still huge, retrying with lower quality...`);
                    if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
                        outputBuffer = await pipeline.jpeg({ quality: 60, mozjpeg: true }).toBuffer();
                    } else if (metadata.format === 'png') {
                        outputBuffer = await pipeline.png({ quality: 60, compressionLevel: 9 }).toBuffer();
                    } else if (metadata.format === 'webp') {
                        outputBuffer = await pipeline.webp({ quality: 60 }).toBuffer();
                    }
                }

                if (outputBuffer.length < buffer.length) {
                    console.log(`[Upload] Optimized to ${(outputBuffer.length / 1024).toFixed(2)} KB`);
                    buffer = outputBuffer;
                }
            }
        } catch (e) {
            console.error('[Upload] Optimization failed, saving original:', e);
        }
    }

    // Create a safe filename
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
    const filename = `${timestamp}_${safeName}`;
    const filePath = join(UPLOADS_DIR, filename);

    writeFileSync(filePath, buffer);
    return filename;
}

// Delete an uploaded file
export function deleteUpload(filename) {
    const filePath = join(UPLOADS_DIR, filename);
    if (existsSync(filePath)) {
        try {
            unlinkSync(filePath);
            console.log(`✅ Deleted upload: ${filePath}`);
        } catch (e) {
            console.error(`Error deleting upload ${filePath}:`, e);
        }
    }
}

// Initialize filesystem
ensureDirectories();
