export interface ProgressEntry {
  level: number;
  completedAt: Date;
  time: number;
  hintsUsed: number;
}

export const progressStore = new Map<string, ProgressEntry[]>();

console.log('\n[Progress Store] Initialized');
console.log(`[Progress Store] Store is empty: ${progressStore.size === 0}\n`);
