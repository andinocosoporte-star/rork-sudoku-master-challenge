import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

const app = new Hono();

app.use("*", cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-trpc-source'],
  credentials: true,
}));

app.get("/", (c) => {
  return c.json({ status: "ok", message: "Sudoku API is running", timestamp: new Date().toISOString() });
});

app.get("/api", (c) => {
  return c.json({ status: "ok", message: "API endpoint is working", timestamp: new Date().toISOString() });
});

app.use(
  "/api/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
    onError({ error, path, type }) {
      console.error(`[tRPC Error] type: ${type}, path: ${path}`);
      console.error('[tRPC Error] details:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
    },
  })
);

app.notFound((c) => {
  console.log(`[404] ${c.req.method} ${c.req.url}`);
  return c.json({ error: "Not found", path: c.req.url }, 404);
});

app.onError((err, c) => {
  console.error('[Hono Error]', err);
  return c.json({ error: err.message, stack: process.env.NODE_ENV === 'development' ? err.stack : undefined }, 500);
});

export default app;
