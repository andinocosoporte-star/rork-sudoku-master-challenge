export interface ProgressEntry {
  level: number;
  completedAt: Date;
  time: number;
  hintsUsed: number;
}

export const progressStore = new Map<string, ProgressEntry[]>();
