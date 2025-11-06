import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { db } from "@/backend/trpc/shared/db";

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
      
      const stmt = db.prepare(`
        INSERT INTO progress (userId, level, completedAt, time, hintsUsed)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(userId, level, new Date().toISOString(), time, hintsUsed);
      
      console.log(`[saveProgress] ✅ Inserted with ID: ${result.lastInsertRowid}`);
      
      const countStmt = db.prepare(`
        SELECT COUNT(*) as count FROM progress WHERE userId = ?
      `);
      const countResult = countStmt.get(userId) as { count: number };
      
      const maxLevelStmt = db.prepare(`
        SELECT MAX(level) as maxLevel FROM progress WHERE userId = ?
      `);
      const maxLevelResult = maxLevelStmt.get(userId) as { maxLevel: number | null };
      
      const response = {
        success: true,
        totalCompleted: countResult.count,
        highestLevel: maxLevelResult.maxLevel || 0,
      };
      
      console.log(`[saveProgress] ✅ SUCCESS:`, response);
      console.log(`=== END [saveProgress] ===\n`);
      
      return response;
    } catch (error) {
      console.error('\n=== [saveProgress] ❌ ERROR ===');
      console.error(error);
      console.error('=== END [saveProgress] ERROR ===\n');
      throw error;
    }
  });
