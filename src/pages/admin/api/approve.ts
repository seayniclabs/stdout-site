import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '../../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  let body: { id?: string; reviewNotes?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }
  if (!body.id) return new Response(JSON.stringify({ error: 'id required' }), { status: 400 });

  const db = getDb();
  const sub = db.select().from(schema.communitySubmissions)
    .where(eq(schema.communitySubmissions.id, body.id)).get();
  if (!sub) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });

  const now = new Date();
  db.update(schema.communitySubmissions).set({
    status: 'published',
    publishedAt: now,
    updatedAt: now,
    version: sub.version + 1,
    reviewNotes: body.reviewNotes || sub.reviewNotes,
  }).where(eq(schema.communitySubmissions.id, body.id)).run();

  return new Response(JSON.stringify({ ok: true, status: 'published' }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
