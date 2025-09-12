import z from 'zod';

import {
  HandlerFunction,
  HandlerServerErrorFn,
  MiddlewareFunction,
  MiddlewareResult,
  NextFunction,
  OriginalRouteHandler,
} from './types';
import { NextResponse } from 'next/server';
import { logger } from '@/logger';

type InternalErrorBody = {
  message: string;
  errors?: z.core.$ZodIssue[];
};

class InternalRouteHandlerError extends Error {
  readonly body: InternalErrorBody;
  constructor(body: InternalErrorBody) {
    super(body.message);
    this.name = 'InternalRouteHandlerError';
    this.body = body;
  }
}

export class RouteHandlerBuilder<
  TParams extends z.Schema = z.Schema,
  TQuery extends z.Schema = z.Schema,
  TBody extends z.Schema = z.Schema,
  TContext = object,
  TMetadata extends z.Schema = z.Schema,
> {
  readonly config: {
    paramsSchema: TParams;
    querySchema: TQuery;
    bodySchema: TBody;
    metadataSchema?: TMetadata;
  };
  readonly middlewares: Array<
    MiddlewareFunction<TContext, Record<string, unknown>, z.infer<TMetadata>>
  >;
  readonly handleServerError?: HandlerServerErrorFn;
  readonly metadataValue: z.infer<TMetadata> | undefined;
  readonly contextType!: TContext;

  constructor({
    config = {
      paramsSchema: undefined as unknown as TParams,
      querySchema: undefined as unknown as TQuery,
      bodySchema: undefined as unknown as TBody,
      metadataSchema: undefined as unknown as TMetadata,
    },
    middlewares = [],
    handleServerError,
    contextType,
    metadataValue,
  }: {
    config?: {
      paramsSchema: TParams;
      querySchema: TQuery;
      bodySchema: TBody;
      metadataSchema?: TMetadata;
    };
    middlewares?: Array<
      MiddlewareFunction<TContext, Record<string, unknown>, z.infer<TMetadata>>
    >;
    handleServerError?: HandlerServerErrorFn;
    contextType: TContext;
    metadataValue?: z.infer<TMetadata>;
  }) {
    this.config = config;
    this.middlewares = middlewares;
    this.handleServerError = handleServerError;
    this.contextType = contextType as TContext;
    this.metadataValue = metadataValue;
  }

  /**
   * Define the schema for the params
   * @param schema - The schema for the params
   * @returns A new instance of the RouteHandlerBuilder
   */
  params<T extends z.Schema>(schema: T) {
    return new RouteHandlerBuilder<T, TQuery, TBody, TContext, TMetadata>({
      ...this,
      config: { ...this.config, paramsSchema: schema },
    });
  }

  /**
   * Define the schema for the query
   * @param schema - The schema for the query
   * @returns A new instance of the RouteHandlerBuilder
   */
  query<T extends z.ZodType>(schema: T) {
    return new RouteHandlerBuilder<TParams, T, TBody, TContext, TMetadata>({
      ...this,
      config: { ...this.config, querySchema: schema },
    });
  }

  /**
   * Define the schema for the body
   * @param schema - The schema for the body
   * @returns A new instance of the RouteHandlerBuilder
   */
  body<T extends z.ZodType>(schema: T) {
    return new RouteHandlerBuilder<TParams, TQuery, T, TContext, TMetadata>({
      ...this,
      config: { ...this.config, bodySchema: schema },
    });
  }

  /**
   * Define the schema for the metadata
   * @param schema - The schema for the metadata
   * @returns A new instance of the RouteHandlerBuilder
   */
  defineMetadata<T extends z.ZodType>(schema: T) {
    return new RouteHandlerBuilder<TParams, TQuery, TBody, TContext, T>({
      ...this,
      config: { ...this.config, metadataSchema: schema },
      middlewares: [],
      metadataValue: undefined,
    });
  }

  /**
   * Set the metadata value for the route handler
   * @param value - The metadata value that will be passed to middlewares
   * @returns A new instance of the RouteHandlerBuilder
   */
  metadata(value: z.infer<TMetadata>) {
    return new RouteHandlerBuilder<TParams, TQuery, TBody, TContext, TMetadata>(
      {
        ...this,
        metadataValue: value,
      }
    );
  }

  /**
   * Add a middleware to the route handler
   * @param middleware - The middleware function to be executed
   * @returns A new instance of the RouteHandlerBuilder
   */
  use<TNestContext extends Record<string, unknown>>(
    middleware: MiddlewareFunction<
      TContext,
      TNestContext & TContext,
      z.infer<TMetadata>
    >
  ): RouteHandlerBuilder<
    TParams,
    TQuery,
    TBody,
    TContext & TNestContext,
    TMetadata
  > {
    type MergedContext = TContext & TNestContext;

    return new RouteHandlerBuilder<
      TParams,
      TQuery,
      TBody,
      MergedContext,
      TMetadata
    >({
      ...this,
      middlewares: [...this.middlewares, middleware],
      contextType: {} as MergedContext,
    });
  }

  /**
   * Create the handler function that will be used by Next.js
   * @param handler - The handler function that will be called when the route is hit
   * @returns The original route handler that Next.js expects with the validation logic
   */
  handler(
    handler: HandlerFunction<
      z.infer<TParams>,
      z.infer<TQuery>,
      z.infer<TBody>,
      TContext,
      z.infer<TMetadata>
    >
  ): OriginalRouteHandler {
    return async (request, context): Promise<NextResponse> => {
      try {
        let params = context?.params
          ? await context.params
          : ({} as z.infer<TParams>);

        const searchParams = request.nextUrl.searchParams;
        let query = Object.fromEntries(
          [...searchParams.keys()].map(key => {
            const values = searchParams.getAll(key);
            return values.length === 1 ? [key, values[0]] : [key, values];
          })
        );
        let metadata = this.metadataValue;

        // Support both JSON and FormData parsing
        let body: unknown = {};
        if (request.method !== 'GET' && request.method !== 'DELETE') {
          try {
            const contentType = request.headers.get('content-type') || '';
            if (
              contentType.includes('multipart/form-data') ||
              contentType.includes('application/x-www-form-urlencoded')
            ) {
              const formData = await request.formData();
              body = Object.fromEntries(formData.entries());
            } else {
              body = await request.json();
            }
          } catch (error) {
            if (this.config.bodySchema) {
              throw new InternalRouteHandlerError({
                message: 'Invalid body',
                errors: [],
              });
            }
            throw error;
          }
        }

        // Validate the params against the provided schema
        if (this.config.paramsSchema) {
          const paramsResult = this.config.paramsSchema.safeParse(params);
          if (!paramsResult.success) {
            throw new InternalRouteHandlerError({
              message: 'Invalid params',
              errors: paramsResult.error.issues,
            });
          }
          params = paramsResult.data;
        }

        // Validate the query against the provided schema
        if (this.config.querySchema) {
          const queryResult = this.config.querySchema.safeParse(query);
          if (!queryResult.success) {
            throw new InternalRouteHandlerError({
              message: 'Invalid query',
              errors: queryResult.error.issues,
            });
          }
          query = queryResult.data;
        }

        // Validate the body against the provided schema
        if (this.config.bodySchema) {
          const bodyResult = this.config.bodySchema.safeParse(body);
          if (!bodyResult.success) {
            throw new InternalRouteHandlerError({
              message: 'Invalid body',
              errors: bodyResult.error.issues,
            });
          }
          body = bodyResult.data;
        }

        // Validate the metadata against the provided schema
        if (this.config.metadataSchema && metadata !== undefined) {
          const metadataResult = this.config.metadataSchema.safeParse(metadata);
          if (!metadataResult.success) {
            throw new InternalRouteHandlerError({
              message: 'Invalid metadata',
              errors: metadataResult.error.issues,
            });
          }
          metadata = metadataResult.data;
        }

        // Execute middleware chain
        let middlewareContext: TContext = {} as TContext;

        const executeMiddlewareChain = async (
          index: number
        ): Promise<NextResponse> => {
          if (index >= this.middlewares.length) {
            try {
              const result = await handler(request, {
                params: params as z.infer<TParams>,
                query: query as z.infer<TQuery>,
                body: body as z.infer<TBody>,
                ctx: middlewareContext,
                metadata: metadata as z.infer<TMetadata>,
              });

              if (result instanceof NextResponse) return result;

              return NextResponse.json(result, {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              });
            } catch (error) {
              return handleError(error as Error, this.handleServerError);
            }
          }

          const middleware = this.middlewares[index];
          if (!middleware) return executeMiddlewareChain(index + 1);

          const next: NextFunction<TContext> = async (options = {}) => {
            if (options.ctx) {
              middlewareContext = { ...middlewareContext, ...options.ctx };
            }
            const result = await executeMiddlewareChain(index + 1);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return result as MiddlewareResult<any>;
          };

          try {
            const result = await middleware({
              request,
              ctx: middlewareContext,
              metadata,
              next,
            });

            if (result instanceof NextResponse) return result;

            middlewareContext = { ...middlewareContext };
            return NextResponse.json(result, {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            });
          } catch (error) {
            return handleError(error as Error, this.handleServerError);
          }
        };

        return executeMiddlewareChain(0);
      } catch (error) {
        return handleError(error as Error, this.handleServerError);
      }
    };
  }
}

const handleError = (
  error: Error,
  handleServerError?: HandlerServerErrorFn
): NextResponse => {
  if (error instanceof InternalRouteHandlerError) {
    logger.emit({
      severityText: 'WARN',
      body: 'Route handler validation error',
      attributes: {
        error: error.message,
        errorBody: JSON.stringify(error.body),
        errorType: 'InternalRouteHandlerError',
      },
    });
    return NextResponse.json(error.body, { status: 400 });
  }

  logger.emit({
    severityText: 'ERROR',
    body: 'Unhandled route handler error',
    attributes: {
      error: error.message,
      stack: error.stack,
      errorType: error.constructor.name,
      hasCustomHandler: !!handleServerError,
    },
  });

  if (handleServerError) {
    return handleServerError(error as Error);
  }

  return NextResponse.json(
    { message: 'Internal server error' },
    { status: 500 }
  );
};
