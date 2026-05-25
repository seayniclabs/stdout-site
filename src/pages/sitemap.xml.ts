import type { APIRoute } from 'astro';

const SITE = 'https://stdout.seayniclabs.com';

const staticPages = [
  { url: '/', changefreq: 'weekly', priority: '1.0' },
  { url: '/library', changefreq: 'daily', priority: '0.9' },
];

export const GET: APIRoute = async () => {
  const urls = staticPages.map(({ url, changefreq, priority }) => `
  <url>
    <loc>${SITE}${url}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
