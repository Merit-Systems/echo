import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { type NextRequest } from 'next/server';
import { appRouter } from '@/trpc/routers';
import { createTRPCContext } from '@/trpc/trpc';
import { logger } from '@/logger';

const createContext = async (req: NextRequest) => {
  return createTRPCContext(req.headers);
};

/**
 * TRPC request handler for all HTTP methods
 */
const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError: ({ path, error }) => {
      logger.emit({
        severityText: 'ERROR',
        body: 'tRPC procedure failed',
        attributes: {
          path: path ?? '<no-path>',
          error: error.message,
          stack: error.stack,
          procedure: path,
        },
      });

      // Also log to console in development for immediate feedback
      if (process.env.NODE_ENV === 'development') {
        console.error(
          `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`
        );
      }
    },
  });

export { handler as GET, handler as POST };
