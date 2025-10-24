import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    const url = process.env.EXPO_PUBLIC_RORK_API_BASE_URL.replace(/\/$/, '');
    console.log('[tRPC] Using EXPO_PUBLIC_RORK_API_BASE_URL:', url);
    return url;
  }

  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    console.log('[tRPC] Using window origin:', origin);
    return origin;
  }

  console.warn('[tRPC] No base url found, using fallback');
  return "http://localhost:8081";
};

const baseUrl = getBaseUrl();
const trpcUrl = `${baseUrl}/api/trpc`;

console.log('[tRPC] Initializing client with URL:', trpcUrl);

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: trpcUrl,
      transformer: superjson,
      headers: () => {
        return {
          "x-trpc-source": "react-native",
        };
      },
      async fetch(url, options) {
        console.log('[tRPC] Request:', url);
        
        try {
          const response = await fetch(url, {
            ...options,
            headers: {
              ...options?.headers,
            },
          });
          
          console.log('[tRPC] Response status:', response.status);
          
          if (!response.ok) {
            const text = await response.clone().text();
            console.error('[tRPC] Error response:', {
              status: response.status,
              statusText: response.statusText,
              body: text.substring(0, 300)
            });
          }
          
          return response;
        } catch (error) {
          console.error('[tRPC] Network error:', error);
          throw error;
        }
      },
    }),
  ],
});
