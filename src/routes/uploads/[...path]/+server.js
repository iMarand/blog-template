import { readFileSync } from 'fs';
import { UPLOADS_DIR } from '$lib/server/storage/filesystem.js';
import { join } from 'path';
import { error } from '@sveltejs/kit';

export async function GET({ params }) {
    const filepath = join(UPLOADS_DIR, params.path);

    try {
        const file = readFileSync(filepath);
        const ext = params.path.split('.').pop().toLowerCase();

        const mimeTypes = {
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            gif: 'image/gif',
            webp: 'image/webp'
        };

        return new Response(file, {
            headers: {
                'Content-Type': mimeTypes[ext] || 'image/jpeg',
                'Cache-Control': 'public, max-age=31536000'
            }
        });
    } catch (err) {
        throw error(404, 'Image not found');
    }
}
