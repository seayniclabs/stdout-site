import Database from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import * as schema from './schema';
import { seedCommunityDocsIfEmpty } from './seed';

let _db: BetterSQLite3Database<typeof schema> | null = null;

function initSchema(sqlite: InstanceType<typeof Database>): void {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS community_submissions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      original_doc_id TEXT NOT NULL,
      sanitized_title TEXT NOT NULL,
      sanitized_content TEXT NOT NULL,
      doc_type TEXT NOT NULL DEFAULT 'note',
      tags TEXT,
      sanitization_log TEXT,
      value_score INTEGER,
      status TEXT NOT NULL DEFAULT 'pending',
      review_notes TEXT,
      version INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      published_at INTEGER
    );
  `);
}

export function getDb(): BetterSQLite3Database<typeof schema> {
  if (_db) return _db;

  const dbPath = process.env.DB_PATH || './data/stdout-site.db';
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const sqlite = new Database(dbPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  initSchema(sqlite);
  _db = drizzle(sqlite, { schema });

  seedCommunityDocsIfEmpty(_db);
  return _db;
}

export { schema };
