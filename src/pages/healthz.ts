import type { APIRoute } from 'astro';
import { getDb } from '../lib/db';

export const GET: APIRoute = async () => {
  try {
    getDb(); // initializes schema + seed on first call
    return new Response(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch {
    return new Response(JSON.stringify({ status: 'error' }), { status: 503 });
  }
};
