import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

export interface ProgressEntry {
  id?: number;
  userId: string;
  level: number;
  completedAt: string;
  time: number;
  hintsUsed: number;
}

const dbDir = path.join(process.cwd(), '.data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'sudoku.db');
console.log(`[Database] Initializing SQLite at: ${dbPath}`);

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    level INTEGER NOT NULL,
    completedAt TEXT NOT NULL,
    time INTEGER NOT NULL,
    hintsUsed INTEGER NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_userId ON progress(userId)
`);

console.log('[Database] ✅ SQLite initialized successfully\n');

export { db };
