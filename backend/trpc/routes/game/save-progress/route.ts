import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";

const progressStore = new Map<string, {
  level: number;
  completedAt: Date;
  time: number;
  hintsUsed: number;
}[]>();

export const saveProgressProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string().optional().default("guest"),
      level: z.number(),
      time: z.number(),
      hintsUsed: z.number(),
    })
  )
  .mutation(async ({ input }) => {
    const { userId, level, time, hintsUsed } = input;
    
    const userProgress = progressStore.get(userId) || [];
    
    userProgress.push({
      level,
      completedAt: new Date(),
      time,
      hintsUsed,
    });
    
    progressStore.set(userId, userProgress);
    
    console.log(`Progress saved for user ${userId}: Level ${level} completed in ${time}s with ${hintsUsed} hints`);
    
    return {
      success: true,
      totalCompleted: userProgress.length,
      highestLevel: Math.max(...userProgress.map(p => p.level)),
    };
  });
