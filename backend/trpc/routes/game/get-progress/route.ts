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
      console.log(`[getProgress] Fetching progress for ${userId}`);
      
      const userProgress = progressStore.get(userId) || [];
      
      const result = {
        completedLevels: userProgress,
        totalCompleted: userProgress.length,
        highestLevel: userProgress.length > 0 ? Math.max(...userProgress.map(p => p.level)) : 0,
      };
      
      console.log(`[getProgress] Found ${result.totalCompleted} completed levels`);
      
      return result;
    } catch (error) {
      console.error('[getProgress] Error:', error);
      throw error;
    }
  });
