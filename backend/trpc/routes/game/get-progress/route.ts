import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { db, type ProgressEntry } from "@/backend/trpc/shared/db";

export const getProgressProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string().default("guest"),
    })
  )
  .query(async ({ input }) => {
    try {
      const { userId } = input;
      
      console.log(`\n=== [getProgress] REQUEST RECEIVED ===`);
      console.log(`User: ${userId}`);
      
      const stmt = db.prepare(`
        SELECT id, userId, level, completedAt, time, hintsUsed
        FROM progress
        WHERE userId = ?
        ORDER BY completedAt DESC
      `);
      
      const userProgress = stmt.all(userId) as ProgressEntry[];
      
      console.log(`[getProgress] ✅ Found ${userProgress.length} completed levels from database`);
      
      const result = {
        completedLevels: userProgress.map(entry => ({
          level: entry.level,
          completedAt: entry.completedAt,
          time: entry.time,
          hintsUsed: entry.hintsUsed,
        })),
        totalCompleted: userProgress.length,
        highestLevel: userProgress.length > 0 
          ? Math.max(...userProgress.map(p => p.level)) 
          : 0,
      };
      
      if (result.totalCompleted > 0) {
        console.log(`Levels completed: ${userProgress.map(p => p.level).join(', ')}`);
      }
      console.log(`=== END [getProgress] ===\n`);
      
      return result;
    } catch (error) {
      console.error('\n=== [getProgress] ❌ ERROR ===');
      console.error(error);
      console.error('=== END [getProgress] ERROR ===\n');
      throw error;
    }
  });
