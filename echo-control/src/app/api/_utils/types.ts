import type { NextRequest, NextResponse } from 'next/server';

/**
 * Function that is called when the route handler is executed and all the middleware has been executed
 * @param request - The request object
 * @param context - The context object
 * @returns The response from the route handler
 */
export type HandlerFunction<
  TParams,
  TQuery,
  TBody,
  TContext,
  TMetadata = unknown,
> = (
  request: NextRequest,
  context: {
    params: TParams;
    query: TQuery;
    body: TBody;
    ctx: TContext;
    metadata?: TMetadata;
  }
) => NextResponse | Promise<NextResponse>;

/**
 * Function signature for the next() function in middleware
 * @param options - Optional configuration object
 * @returns Promise resolving to the response from the next middleware or handler
 */
export type NextFunction<TContext> = <NC extends object = object>(opts?: {
    ctx?: NC;
  }) => Promise<MiddlewareResult<NC & TContext>>;

/**
 * Middleware function that can:
 * 1. Execute code before/after the handler
 * 2. Modify the response
 * 3. Add context data that will be available to subsequent middleware and the handler
 * 4. Short-circuit the middleware chain by returning a Response
 *
 * Type parameters:
 * - TContext: The type of the existing context
 * - TNewContext: The type of additional context this middleware adds
 * - TMetadata: The type of metadata available to the middleware
 *
 * @param opts - Configuration object for the middleware
 *
 * @returns Promise resolving to either additional context or a Response to short-circuit
 */
export type MiddlewareFunction<
  TContext = Record<string, unknown>,
  TNextContext = Record<string, unknown>,
  TMetadata = unknown,
> = (opts: {
  request: NextRequest;
  ctx: TContext;
  metadata?: TMetadata;
  next: NextFunction<TContext>;
}) => Promise<MiddlewareResult<TNextContext>>;

// Middleware should return a Response
// But in order to infer the context, we extends the response with the context
// This context is not really used and not really needed
export type MiddlewareResult<TContext> = NextResponse & { ctx?: TContext };
/**
 * Original Next.js route handler type for reference
 * This is the type that Next.js uses internally before our library wraps it
 */
export type OriginalRouteHandler = (
  request: NextRequest,
  context: { params: Promise<Record<string, unknown>> }
) => Promise<NextResponse>;

/**
 * Function that handles server errors in route handlers
 * @param error - The error that was thrown
 * @returns Response object with appropriate error details and status code
 */
export type HandlerServerErrorFn = (error: Error) => NextResponse;
