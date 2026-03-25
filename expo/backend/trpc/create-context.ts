import { inferAsyncReturnType } from '@trpc/server';

// Create context for our API
export function createContext({ req }: { req: Request }) {
  const headers = req.headers;
  
  const userId = headers.get('x-user-id') || '';
  const userEmail = headers.get('x-user-email') || '';
  const userName = headers.get('x-user-name') || '';
  const userPlan = headers.get('x-user-plan') || '';
  const userIsAdmin = headers.get('x-user-is-admin') === 'true';
  const accessToken = headers.get('x-access-token') || headers.get('authorization')?.replace('Bearer ', '') || '';
  
  const user = userId ? {
    id: userId,
    email: userEmail,
    name: userName,
    plan: userPlan,
    isAdmin: userIsAdmin,
    accessToken: accessToken,
  } : null;
  
  return {
    req,
    user,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;