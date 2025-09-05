import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import z, { ZodError } from 'zod';
import { auth } from '@/auth';
import { Session } from 'next-auth';
import { db } from '@/lib/db';
import { timeBasedPaginationSchema } from '@/services/lib/pagination';

/**
 * Context that is passed to all TRPC procedures
 */
export interface Context {
  session: Session | null;
  headers: Headers;
}

/**
 * Create context for each request
 */
export async function createTRPCContext(headers: Headers): Promise<Context> {
  const session = await auth();

  return {
    session,
    headers,
  };
}

/**
 * Initialize TRPC with our context and transformer
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// ----------------------------
// Export reusable router and procedure helpers
// ----------------------------

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;
export const middleware = t.middleware;

// ----------------------------
// Middleware
// ----------------------------

const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise(resolve => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

// ----------------------------
// Procedures
// ----------------------------

/**
 * Public procedure that does not require authentication
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Protected procedure that requires authentication
 */
export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const user = await db.user.findUnique({
    where: { id: ctx.session.user.id },
  });

  if (!user?.admin) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({ ctx });
});

export const paginatedProcedure = t.procedure
  .input(
    z.object({
      cursor: z.number().optional().default(0),
      page_size: z.number().optional().default(10),
    })
  )
  .use(async ({ ctx, next, input }) => {
    return next({
      ctx: {
        ...ctx,
        pagination: { page: input.cursor, page_size: input.page_size },
      },
    });
  });

export const timeBasedPaginatedProcedure = t.procedure
  .input(timeBasedPaginationSchema)
  .use(async ({ ctx, next, input }) => {
    return next({
      ctx: { ...ctx, pagination: input },
    });
  });
