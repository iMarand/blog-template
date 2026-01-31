import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define UPLOADS_DIR relative to this script or use environment variable
// Assuming script is in /scripts and uploads is in /data/uploads (project root/data/uploads)
const PROJECT_ROOT = path.join(__dirname, '..');
const UPLOADS_DIR = process.env.UPLOADS_PATH || path.join(PROJECT_ROOT, 'data', 'uploads');

const MAX_SIZE_BYTES = 500 * 1024; // 500KB
const MAX_WIDTH = 1920; // 1920px width limit

async function optimizeImages() {
    console.log(`Starting image optimization in: ${UPLOADS_DIR}`);

    if (!fs.existsSync(UPLOADS_DIR)) {
        console.error(`Directory not found: ${UPLOADS_DIR}`);
        return;
    }

    const files = fs.readdirSync(UPLOADS_DIR);
    let optimizedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    let savedBytes = 0;

    for (const file of files) {
        const filePath = path.join(UPLOADS_DIR, file);

        try {
            const stats = fs.statSync(filePath);

            // Skip directories or non-image files
            if (stats.isDirectory()) continue;
            if (!/\.(jpg|jpeg|png|webp|avif|tiff|gif)$/i.test(file)) continue;

            const originalSize = stats.size;

            if (originalSize > MAX_SIZE_BYTES) {
                console.log(`Optimizing: ${file} (${(originalSize / 1024).toFixed(2)} KB)`);

                const buffer = fs.readFileSync(filePath);

                // Process image: resize and compress
                // We'll use the original format unless it's huge, but sharp auto-detects input.
                // Outputting to buffer to check size before overwriting.

                let pipeline = sharp(buffer);
                const metadata = await pipeline.metadata();

                // Resize if too wide
                if (metadata.width > MAX_WIDTH) {
                    pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
                }

                // Compress based on format
                // We'll attempt to keep the same format but increase compression
                // Note: For simplicity and best compatibility/size balance, we might want to standardize,
                // but requirements said "change all my images... to 500kb".
                // We will try to re-encode with high quality first, if still big, lower quality.

                // Using a generic approach: re-encode buffer
                // Sharp's `toBuffer` determines format from input if not specified, 
                // but we might want to force some settings.

                let outputBuffer;

                if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
                    outputBuffer = await pipeline.jpeg({ quality: 80, mozjpeg: true }).toBuffer();
                } else if (metadata.format === 'png') {
                    outputBuffer = await pipeline.png({ quality: 80, compressionLevel: 8 }).toBuffer();
                } else if (metadata.format === 'webp') {
                    outputBuffer = await pipeline.webp({ quality: 80 }).toBuffer();
                } else {
                    // Fallback for others
                    outputBuffer = await pipeline.toBuffer();
                }

                // If still > 500KB, try aggressive compression
                if (outputBuffer.length > MAX_SIZE_BYTES) {
                    console.log(`  > Still > 500KB, retrying with lower quality...`);
                    if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
                        outputBuffer = await pipeline.jpeg({ quality: 60, mozjpeg: true }).toBuffer();
                    } else if (metadata.format === 'png') {
                        // PNG hard to shrink if complex, maybe convert to webp? 
                        // User didn't ask to convert formats, just "change images". 
                        // Let's stick to same format for safety unless directed otherwise, 
                        // but maybe increase compression
                        outputBuffer = await pipeline.png({ quality: 60, compressionLevel: 9 }).toBuffer();
                    } else if (metadata.format === 'webp') {
                        outputBuffer = await pipeline.webp({ quality: 60 }).toBuffer();
                    }
                }

                const newSize = outputBuffer.length;

                if (newSize < originalSize) {
                    fs.writeFileSync(filePath, outputBuffer);
                    const savings = originalSize - newSize;
                    savedBytes += savings;
                    optimizedCount++;
                    console.log(`  ✅ Optimized: ${(newSize / 1024).toFixed(2)} KB (Saved: ${(savings / 1024).toFixed(2)} KB)`);
                } else {
                    console.log(`  ⏹️ Skipped (Optimization didn't reduce size effectively)`);
                    skippedCount++;
                }

            } else {
                skippedCount++;
            }
        } catch (err) {
            console.error(`  ❌ Error processing ${file}:`, err.message);
            errorCount++;
        }
    }

    console.log('\n--- Summary ---');
    console.log(`Total Images Processed: ${optimizedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Total Space Saved: ${(savedBytes / (1024 * 1024)).toFixed(2)} MB`);
}

optimizeImages();
