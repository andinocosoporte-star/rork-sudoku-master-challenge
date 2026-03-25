export interface ProgressEntry {
  id?: number;
  userId: string;
  level: number;
  completedAt: string;
  time: number;
  hintsUsed: number;
}

// In-memory storage for progress (will persist across requests but not server restarts)
const progressStore = new Map<string, ProgressEntry[]>();

console.log('[Database] ✅ In-memory storage initialized');

export const db = {
  prepare: (sql: string) => {
    return {
      all: (userId: string): ProgressEntry[] => {
        console.log(`[DB] SELECT all for userId: ${userId}`);
        const entries = progressStore.get(userId) || [];
        console.log(`[DB] Found ${entries.length} entries`);
        return entries;
      },
      run: (userId: string, level: number, completedAt: string, time: number, hintsUsed: number) => {
        console.log(`[DB] INSERT for userId: ${userId}, level: ${level}`);
        const entries = progressStore.get(userId) || [];
        const newEntry: ProgressEntry = {
          id: Date.now(),
          userId,
          level,
          completedAt,
          time,
          hintsUsed,
        };
        entries.push(newEntry);
        progressStore.set(userId, entries);
        console.log(`[DB] Total entries for user: ${entries.length}`);
        return { lastInsertRowid: newEntry.id };
      },
      get: (userId: string): { count: number } | { maxLevel: number | null } => {
        const entries = progressStore.get(userId) || [];
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
