import { db, schema } from '$lib/server/db/index.js';
import { sql } from 'drizzle-orm';

export async function GET({ url }) {
    const origin = url.origin;

    const posts = db
        .select({ slug: schema.posts.slug, updatedAt: schema.posts.updatedAt })
        .from(schema.posts)
        .where(sql`${schema.posts.published} = 1 AND ${schema.posts.inSitemap} = 1`)
        .all();

    const pages = db
        .select({ slug: schema.pages.slug, updatedAt: schema.pages.updatedAt })
        .from(schema.pages)
        .where(sql`${schema.pages.published} = 1 AND ${schema.pages.inSitemap} = 1`)
        .all();

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${origin}/</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    ${posts.map(post => `
    <url>
        <loc>${origin}/blog/${post.slug}</loc>
        <lastmod>${new Date(post.updatedAt).toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`).join('')}
    ${pages.map(page => `
    <url>
        <loc>${origin}/${page.slug}</loc>
        <lastmod>${new Date(page.updatedAt).toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.5</priority>
    </url>`).join('')}
</urlset>`;

    return new Response(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'max-age=0, s-maxage=3600'
        }
    });
}
