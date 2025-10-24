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
          console.warn('[tRPC] Backend not configured, skipping request');
          return new Response(
            JSON.stringify({ error: 'Backend not configured' }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
          );
        }

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
              body: text.substring(0, 200)
            });
            
            if (response.status === 404) {
              console.error('[tRPC] ❌ Backend endpoint not found at:', baseUrl);
              console.error('[tRPC] ❌ Make sure backend is deployed and URL is correct');
            }
          }
          
          return response;
        } catch (error) {
          console.error('[tRPC] Network error:', error);
          console.error('[tRPC] Failed to connect to:', baseUrl);
          if (error instanceof Error) {
            throw error;
          }
          throw new Error(String(error));
        }
      },
    }),
  ],
});
