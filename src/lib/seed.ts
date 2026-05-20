import fs from 'node:fs';
import path from 'node:path';
import { nanoid } from 'nanoid';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

function parseFrontmatter(raw: string): { title: string; type: string; tags: string; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { title: 'Untitled', type: 'note', tags: '', body: raw };
  }
  const fm = match[1];
  const body = match[2].trim();
  const title = fm.match(/^title:\s*"?([^"\n]+)"?/m)?.[1]?.trim() || 'Untitled';
  const type = fm.match(/^type:\s*(\S+)/m)?.[1]?.trim() || 'note';
  const tagsLine = fm.match(/^tags:\s*(.+)/m)?.[1]?.trim() || '';
  return { title, type, tags: tagsLine, body };
}

export function seedCommunityDocsIfEmpty(db: BetterSQLite3Database<typeof schema>): void {
  if (db.select().from(schema.communitySubmissions).all().length > 0) return;

  const seedDir = process.env.SEED_DIR || path.join(process.cwd(), 'community-seed');
  if (!fs.existsSync(seedDir)) {
    console.warn('[seed] community-seed directory not found:', seedDir);
    return;
  }

  const files = fs.readdirSync(seedDir).filter(f => f.endsWith('.md')).sort();
  const now = new Date();

  for (const file of files) {
    const raw = fs.readFileSync(path.join(seedDir, file), 'utf-8');
    const { title, type, tags, body } = parseFrontmatter(raw);
    const id = `seed_${file.replace(/\.md$/, '')}`;
    db.insert(schema.communitySubmissions).values({
      id,
      userId: 'seed',
      originalDocId: id,
      sanitizedTitle: title,
      sanitizedContent: body,
      docType: type,
      tags,
      sanitizationLog: '[]',
      valueScore: 100,
      status: 'published',
      version: 1,
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
    }).run();
  }

  console.log(`[seed] Loaded ${files.length} community docs from ${seedDir}`);
}
