import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/backend/trpc/app-router';
import { createContext } from '@/backend/trpc/create-context';

const handler = async (req: Request) => {
  const url = new URL(req.url);
  console.log(`⚡️ [tRPC] ${req.method} ${url.pathname}`);
  
  try {
    const response = await fetchRequestHandler({
      endpoint: '/api/trpc',
      req,
      router: appRouter,
      createContext,
      onError: ({ error, path }) => {
        console.error(`❌ tRPC Error on ${path}:`, error.message);
      },
      responseMeta: ({ errors, type }) => {
        const allOk = errors.length === 0;
        const isQuery = type === 'query';
        
        return {
          headers: {
            'Content-Type': 'application/json',
            ...(allOk && isQuery ? { 'Cache-Control': 's-maxage=5, stale-while-revalidate=59' } : {}),
          },
        };
      },
    });
    
    return response;
  } catch (error) {
    console.error(`❌ [tRPC] Handler error:`, error);
    return new Response(
      JSON.stringify({ error: { message: 'Internal server error' } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export { handler as GET, handler as POST };
