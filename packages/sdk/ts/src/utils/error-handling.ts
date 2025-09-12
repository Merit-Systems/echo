import { HttpClient } from '../http-client';

/**
 * Base Echo error class
 */
export class EchoError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly endpoint?: string;

  constructor(
    code: string,
    message: string,
    options?: {
      statusCode?: number;
      endpoint?: string;
    }
  ) {
    super(message);
    this.name = 'EchoError';
    this.code = code;
    if (options?.statusCode !== undefined) this.statusCode = options.statusCode;
    if (options?.endpoint !== undefined) this.endpoint = options.endpoint;
  }
}

/**
 * Parse errors from fetch responses
 */
export function parseEchoError(
  error: Error,
  context?: string,
  endpoint?: string
): EchoError {
  // Network errors
  if (error.name === 'TypeError') {
    return new EchoError(
      'NETWORK_ERROR',
      `Network error${context ? ` while ${context}` : ''}`,
      endpoint ? { endpoint } : undefined
    );
  }

  // HTTP errors from our client (format: "HTTP 401: error details")
  const httpMatch = error.message.match(/^HTTP (\d+): (.*)$/);
  if (httpMatch && httpMatch[1] && httpMatch[2]) {
    const status = parseInt(httpMatch[1]);
    const details = httpMatch[2];

    return new EchoError(
      `HTTP_${status}`,
      `${details}${context ? ` while ${context}` : ''}`,
      endpoint ? { statusCode: status, endpoint } : { statusCode: status }
    );
  }

  // Fallback
  return new EchoError(
    'UNKNOWN_ERROR',
    `${error.message}${context ? ` while ${context}` : ''}`,
    endpoint ? { endpoint } : undefined
  );
}

/**
 * Base class for all resources
 */
export abstract class BaseResource {
  constructor(protected http: HttpClient) {}

  /**
   * Generic wrapper for API calls with error handling
   */
  protected async handleRequest<T>(
    request: () => Promise<Response>,
    context: string,
    endpoint?: string
  ): Promise<T> {
    try {
      const response = await request();

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof Error) {
        throw parseEchoError(error, context, endpoint);
      }
      throw new EchoError(
        'UNKNOWN_ERROR',
        'Unknown error occurred',
        endpoint ? { endpoint } : undefined
      );
    }
  }
}
