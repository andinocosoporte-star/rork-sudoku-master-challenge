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
      
      console.log(`\n=== [saveProgress] REQUEST RECEIVED ===`);
      console.log(`User: ${userId}, Level: ${level}, Time: ${time}s, Hints: ${hintsUsed}`);
      
      const currentProgress = progressStore.get(userId) || [];
      console.log(`Current progress count: ${currentProgress.length}`);
      
      const newEntry = {
        level,
        completedAt: new Date(),
        time,
        hintsUsed,
      };
      
      currentProgress.push(newEntry);
      progressStore.set(userId, currentProgress);
      
      console.log(`New progress count: ${currentProgress.length}`);
      console.log(`Progress store size: ${progressStore.size} users`);
      
      const result = {
        success: true,
        totalCompleted: currentProgress.length,
        highestLevel: Math.max(...currentProgress.map(p => p.level)),
      };
      
      console.log(`[saveProgress] ✅ SUCCESS:`, result);
      console.log(`=== END [saveProgress] ===\n`);
      
      return result;
    } catch (error) {
      console.error('\n=== [saveProgress] ❌ ERROR ===');
      console.error(error);
      console.error('=== END [saveProgress] ERROR ===\n');
      throw error;
    }
  });
