import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

export const DEFAULT_DB_PATH = path.resolve(__dirname, '../../data/app.db');

export function resolveDbPath(): string {
  return process.env.DB_PATH ?? DEFAULT_DB_PATH;
}

export function openDb(dbPath: string = resolveDbPath()): Database.Database {
  if (dbPath !== ':memory:') {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}
