import type { APIRoute } from 'astro';
import { nanoid } from 'nanoid';
import { getDb, schema } from '../../../lib/db';
import { scoreSubmission } from '../../../lib/value-score';

export const POST: APIRoute = async ({ request }) => {
  let body: {
    sanitizedTitle?: string;
    sanitizedContent?: string;
    docType?: string;
    tags?: string;
    valueScore?: number;
    sanitizationLog?: unknown[];
  };

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!body.sanitizedTitle || !body.sanitizedContent || !body.docType) {
    return new Response(JSON.stringify({ error: 'sanitizedTitle, sanitizedContent, and docType required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const score = scoreSubmission({
    title: body.sanitizedTitle,
    content: body.sanitizedContent,
    docType: body.docType,
  });

  if (!score.passed) {
    return new Response(JSON.stringify({
      error: 'Submission did not meet quality threshold',
      score: score.score,
      reasons: score.reasons,
    }), {
      status: 422,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Record submitter key as opaque id — no local license DB; admin review handles abuse
  let userId = 'anonymous';
  const auth = request.headers.get('Authorization');
  if (auth?.startsWith('Bearer ')) {
    const key = auth.slice(7).trim();
    if (key) userId = `submitter_${key}`;
  }

  const submissionId = nanoid();
  const now = new Date();
  const db = getDb();

  db.insert(schema.communitySubmissions).values({
    id: submissionId,
    userId,
    originalDocId: submissionId,
    sanitizedTitle: body.sanitizedTitle,
    sanitizedContent: body.sanitizedContent,
    docType: body.docType,
    tags: body.tags || '',
    sanitizationLog: JSON.stringify(body.sanitizationLog || []),
    valueScore: score.score,
    status: 'pending',
    version: 1,
    createdAt: now,
    updatedAt: now,
  }).run();

  return new Response(JSON.stringify({ submissionId, status: 'pending' }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
