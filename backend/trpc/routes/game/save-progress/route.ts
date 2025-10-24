import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { progressStore } from "@/backend/trpc/shared/progress-store";

export const saveProgressProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string().default("guest"),
      level: z.number().int().positive(),
      time: z.number().int().nonnegative(),
      hintsUsed: z.number().int().nonnegative(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const { userId, level, time, hintsUsed } = input;
      
      console.log(`[saveProgress] Saving progress for ${userId}, level ${level}`);
      
      const userProgress = progressStore.get(userId) || [];
      
      userProgress.push({
        level,
        completedAt: new Date(),
        time,
        hintsUsed,
      });
      
      progressStore.set(userId, userProgress);
      
      const result = {
        success: true,
        totalCompleted: userProgress.length,
        highestLevel: Math.max(...userProgress.map(p => p.level)),
      };
      
      console.log(`[saveProgress] Success:`, result);
      
      return result;
    } catch (error) {
      console.error('[saveProgress] Error:', error);
      throw error;
    }
  });
