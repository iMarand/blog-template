import { error } from '@sveltejs/kit';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { UPLOADS_DIR } from '$lib/server/storage/filesystem.js';

export function GET({ params }) {
    const filename = params.path;
    const filePath = join(UPLOADS_DIR, filename);

    if (!existsSync(filePath)) {
        throw error(404, 'File not found');
    }

    const file = readFileSync(filePath);
    const ext = filename.split('.').pop().toLowerCase();

    // Simple mime type mapping
    const mimeTypes = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'svg': 'image/svg+xml'
    };

    return new Response(file, {
        headers: {
            'Content-Type': mimeTypes[ext] || 'application/octet-stream',
            'Cache-Control': 'public, max-age=31536000, immutable'
        }
    });
}
