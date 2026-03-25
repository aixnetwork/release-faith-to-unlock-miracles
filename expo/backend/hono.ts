import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import { ENV } from "../config/env";

const app = new Hono();

// Log all incoming requests
app.use("*", async (c, next) => {
  const url = new URL(c.req.url);
  console.log(`🔵 [Hono ${c.req.method}] ${c.req.path}`);
  console.log(`🔵 [Hono] Full URL:`, url.href);
  console.log(`🔵 [Hono] Headers:`, {
    'content-type': c.req.header('content-type'),
    'authorization': c.req.header('authorization') ? 'Bearer ***' : 'none',
  });
  
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  
  console.log(`✅ [Hono] ${c.req.method} ${c.req.path} - ${c.res.status} (${duration}ms)`);
});

// Enable CORS for all routes with permissive settings
app.use("*", cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-email', 'x-user-name', 'x-user-plan', 'x-user-is-admin'],
  exposeHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 600,
  credentials: true,
}));

// Mount tRPC handler at /api/trpc (to match Expo Router structure)
app.use(
  "/api/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
    endpoint: '/api/trpc',
    onError: ({ error, path }) => {
      console.error(`❌ tRPC Error on ${path}:`, error);
    },
  })
);

// Also mount at /trpc for backward compatibility
app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
    endpoint: '/trpc',
    onError: ({ error, path }) => {
      console.error(`❌ tRPC Error on ${path}:`, error);
    },
  })
);


// Proxy endpoint to forward requests to Directus (bypassing CORS)
app.all("/api/proxy/*", async (c) => {
  const path = c.req.path.replace('/api/proxy', '');
  const reqUrl = new URL(c.req.url);
  const queryString = reqUrl.search;
  
  // Construct the target URL
  // Remove any double slashes but keep the protocol
  const baseUrl = ENV.EXPO_PUBLIC_RORK_API_BASE_URL.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${baseUrl}${cleanPath}${queryString}`;

  console.log(`[Proxy] Forwarding ${c.req.method} request to: ${url}`);

  try {
    const method = c.req.method;
    const headers = new Headers(c.req.header());
    
    // Remove host header to avoid issues with target server
    headers.delete('host');
    headers.delete('connection');
    headers.delete('origin');
    headers.delete('referer');
    
    // Forward the request
    const response = await fetch(url, {
      method,
      headers,
      body: method !== 'GET' && method !== 'HEAD' ? await c.req.arrayBuffer() : undefined,
    });

    console.log(`[Proxy] Response status: ${response.status}`);

    // Return the response
    return new Response(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    console.error('[Proxy] Error:', error);
    return c.json({ error: 'Proxy request failed', details: String(error) }, 500);
  }
});

app.all("/proxy/*", async (c) => {
  // Backward compatibility
  const path = c.req.path.replace('/proxy', '');
  const reqUrl = new URL(c.req.url);
  const queryString = reqUrl.search;
  const url = `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}${path}${queryString}`;

  try {
    const method = c.req.method;
    const headers = new Headers(c.req.header());
    
    // Remove host header to avoid issues with target server
    headers.delete('host');
    headers.delete('connection');
    
    // Forward the request
    const response = await fetch(url, {
      method,
      headers,
      body: method !== 'GET' && method !== 'HEAD' ? await c.req.arrayBuffer() : undefined,
    });

    // Return the response
    return new Response(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return c.json({ error: 'Proxy request failed' }, 500);
  }
});

// Simple health check endpoint
app.get("/", (c) => {
  return c.json({ 
    status: "ok", 
    message: "API is running",
    timestamp: new Date().toISOString(),
    env: {
      hasBackendUrl: !!ENV.EXPO_PUBLIC_BACKEND_URL,
      backendUrl: ENV.EXPO_PUBLIC_BACKEND_URL || 'not set',
    }
  });
});

// Test endpoint to verify tRPC is accessible
app.get("/test-trpc", (c) => {
  return c.json({
    status: "ok",
    message: "tRPC endpoint should be at /api/trpc",
    timestamp: new Date().toISOString(),
  });
});

// Debug endpoint to test API routes
app.get("/api/health", (c) => {
  return c.json({
    status: "ok",
    message: "Backend API is working",
    timestamp: new Date().toISOString(),
    env: {
      hasBackendUrl: !!ENV.EXPO_PUBLIC_BACKEND_URL,
      backendUrl: ENV.EXPO_PUBLIC_BACKEND_URL || 'not set',
    },
  });
});

// Debug endpoint
app.all("/api/debug", (c) => {
  return c.json({
    status: "ok",
    method: c.req.method,
    path: c.req.path,
    url: c.req.url,
    headers: Object.fromEntries(c.req.header() as any),
  });
});

// Catch-all handler for unmatched routes (must be last)
app.all("*", (c) => {
  console.error(`❌ [Hono] Unmatched route: ${c.req.method} ${c.req.path}`);
  console.error(`❌ [Hono] Full URL:`, c.req.url);
  return c.json({
    error: "Not Found",
    message: `Route ${c.req.method} ${c.req.path} not found`,
    path: c.req.path,
    method: c.req.method,
    url: c.req.url,
    availableRoutes: [
      "/api/trpc/*",
      "/trpc/*",
      "/api/health",
      "/api/debug",
      "/test-trpc",
    ],
  }, 404);
});

export default app;
