import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { progressStore } from "@/backend/trpc/shared/progress-store";

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
      console.log(`Progress store size: ${progressStore.size} users`);
      
      const userProgress = progressStore.get(userId) || [];
      
      const result = {
        completedLevels: userProgress,
        totalCompleted: userProgress.length,
        highestLevel: userProgress.length > 0 ? Math.max(...userProgress.map(p => p.level)) : 0,
      };
      
      console.log(`[getProgress] ✅ Found ${result.totalCompleted} completed levels`);
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
