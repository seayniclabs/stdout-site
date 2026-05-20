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
  db.update(schema.communitySubmissions).set({
    status: 'rejected',
    reviewNotes: body.reviewNotes || null,
    updatedAt: new Date(),
  }).where(eq(schema.communitySubmissions.id, body.id)).run();

  return new Response(JSON.stringify({ ok: true, status: 'rejected' }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
