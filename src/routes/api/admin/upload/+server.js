import { json, error } from '@sveltejs/kit';
import { saveUpload } from '$lib/server/storage/filesystem.js';

export async function POST({ request, locals }) {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const data = await request.formData();
    const file = data.get('file');

    if (!file || !(file instanceof File)) {
        return json({ error: 'No file uploaded' }, { status: 400 });
    }

    try {
        const filename = await saveUpload(file);
        return json({
            success: true,
            url: `/api/uploads/${filename}`,
            filename
        });
    } catch (e) {
        console.error('Upload error:', e);
        return json({ error: 'Failed to save file' }, { status: 500 });
    }
}
