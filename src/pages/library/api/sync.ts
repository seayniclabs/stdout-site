import type { APIRoute } from 'astro';
import { eq, gt, and } from 'drizzle-orm';
import { getDb, schema } from '../../../lib/db';

export const GET: APIRoute = async ({ url }) => {
  const sinceVersion = parseInt(url.searchParams.get('since_version') || '0', 10) || 0;
  const db = getDb();

  const published = db.select().from(schema.communitySubmissions)
    .where(and(
      eq(schema.communitySubmissions.status, 'published'),
      gt(schema.communitySubmissions.version, sinceVersion),
    ))
    .all();

  const withdrawn = db.select({ id: schema.communitySubmissions.id })
    .from(schema.communitySubmissions)
    .where(eq(schema.communitySubmissions.status, 'withdrawn'))
    .all();

  const docs = published.map(sub => ({
    id: sub.id,
    title: sub.sanitizedTitle,
    content: sub.sanitizedContent,
    docType: sub.docType,
    tags: sub.tags,
    version: sub.version,
    publishedAt: sub.publishedAt?.getTime() || sub.updatedAt.getTime(),
  }));

  return new Response(JSON.stringify({
    docs,
    withdrawn: withdrawn.map(w => w.id),
    syncVersion: Math.max(sinceVersion, ...docs.map(d => d.version), 0),
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
