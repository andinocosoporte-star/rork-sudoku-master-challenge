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

  console.warn('[tRPC] No base url found, backend features will be unavailable');
  return "";
};

const baseUrl = getBaseUrl();
const trpcUrl = baseUrl ? `${baseUrl}/api/trpc` : '';

if (!baseUrl) {
  console.warn('[tRPC] ⚠️ Backend URL not configured. Backend features will be unavailable.');
  console.warn('[tRPC] The app will work in offline mode with local-only features.');
} else {
  console.log('[tRPC] Initializing client with URL:', trpcUrl);
}

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
        if (!baseUrl || !trpcUrl) {
          return new Response(
            JSON.stringify({ 
              error: { 
                message: 'Backend not configured', 
                data: { httpStatus: 503 }, 
                code: 'BACKEND_NOT_CONFIGURED' 
              } 
            }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
          );
        }
        
        try {
          const response = await fetch(url, {
            ...options,
            headers: {
              ...options?.headers,
            },
          });
          
          if (!response.ok && response.status === 404) {
            return new Response(
              JSON.stringify({ 
                error: { 
                  message: 'tRPC endpoint not found. Make sure the backend is running at ' + baseUrl,
                  data: { httpStatus: 404 }, 
                  code: 'NOT_FOUND' 
                } 
              }),
              { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
          }
          
          return response;
        } catch (error) {
          return new Response(
            JSON.stringify({ 
              error: { 
                message: error instanceof Error ? error.message : String(error),
                data: { httpStatus: 500 }, 
                code: 'NETWORK_ERROR' 
              } 
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }
      },
    }),
  ],
});
