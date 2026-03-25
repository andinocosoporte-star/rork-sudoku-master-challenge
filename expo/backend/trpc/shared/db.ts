import fs from 'node:fs';
import path from 'node:path';

export interface ProgressEntry {
  id?: number;
  userId: string;
  level: number;
  completedAt: string;
  time: number;
  hintsUsed: number;
}

interface DbData {
  progress: ProgressEntry[];
  nextId: number;
}

const DB_FILE = path.join(process.cwd(), '.sudoku-db.json');

function loadDbData(): DbData {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw) as DbData;
      console.log(`[DB] ✅ Loaded ${data.progress.length} entries from disk`);
      return data;
    }
  } catch (error) {
    console.error('[DB] ❌ Error loading DB file:', error);
  }
  return { progress: [], nextId: 1 };
}

function saveDbData(data: DbData): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`[DB] ✅ Saved ${data.progress.length} entries to disk`);
  } catch (error) {
    console.error('[DB] ❌ Error saving DB file:', error);
  }
}

let dbData = loadDbData();

console.log(`[Database] ✅ File-based storage initialized at ${DB_FILE}`);

export const db = {
  prepare: (sql: string) => {
    return {
      all: (userId: string): ProgressEntry[] => {
        console.log(`[DB] SELECT all for userId: ${userId}`);
        const entries = dbData.progress.filter(e => e.userId === userId);
        console.log(`[DB] Found ${entries.length} entries`);
        return entries;
      },
      run: (userId: string, level: number, completedAt: string, time: number, hintsUsed: number) => {
        console.log(`[DB] INSERT for userId: ${userId}, level: ${level}`);
        const newEntry: ProgressEntry = {
          id: dbData.nextId++,
          userId,
          level,
          completedAt,
          time,
          hintsUsed,
        };
        dbData.progress.push(newEntry);
        saveDbData(dbData);
        console.log(`[DB] Total entries: ${dbData.progress.length}`);
        return { lastInsertRowid: newEntry.id };
      },
      get: (userId: string): { count: number } | { maxLevel: number | null } => {
        const entries = dbData.progress.filter(e => e.userId === userId);
        if (sql.includes('COUNT')) {
          return { count: entries.length };
        }
        if (sql.includes('MAX')) {
          const maxLevel = entries.length > 0 ? Math.max(...entries.map(e => e.level)) : null;
          return { maxLevel };
        }
        return { count: 0 };
      },
    };
  },
};
