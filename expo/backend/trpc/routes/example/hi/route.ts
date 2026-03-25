import { publicProcedure } from '../../../trpc';

export const hiProcedure = publicProcedure.query(() => {
  return {
    greeting: 'Hello from tRPC server',
  };
});