import type { Database } from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

export function migrate(db: Database): void {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  db.exec(schema);
}
