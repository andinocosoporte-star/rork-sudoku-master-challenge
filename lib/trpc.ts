import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  console.warn("No base url found, using fallback");
  return "http://localhost:3000";
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      async fetch(url, options) {
        console.log('[tRPC] Making request to:', url);
        
        const response = await fetch(url, {
          ...options,
          headers: {
            ...options?.headers,
            "Content-Type": "application/json",
          },
        });
        
        if (!response.ok) {
          console.error('[tRPC] Request failed:', response.status, response.statusText);
          const text = await response.clone().text();
          console.error('[tRPC] Response body:', text.substring(0, 500));
        }
        
        return response;
      },
    }),
  ],
});
