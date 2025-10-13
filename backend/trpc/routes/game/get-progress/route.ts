import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";

const progressStore = new Map<string, {
  level: number;
  completedAt: Date;
  time: number;
  hintsUsed: number;
}[]>();

export const getProgressProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string().optional().default("guest"),
    })
  )
  .query(async ({ input }) => {
    const { userId } = input;
    const userProgress = progressStore.get(userId) || [];
    
    return {
      completedLevels: userProgress,
      totalCompleted: userProgress.length,
      highestLevel: userProgress.length > 0 ? Math.max(...userProgress.map(p => p.level)) : 0,
    };
  });
