import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { saveProgressProcedure } from "./routes/game/save-progress/route";
import { getProgressProcedure } from "./routes/game/get-progress/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  game: createTRPCRouter({
    saveProgress: saveProgressProcedure,
    getProgress: getProgressProcedure,
  }),
});

export type AppRouter = typeof appRouter;
