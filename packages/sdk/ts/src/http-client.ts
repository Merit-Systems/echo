import { TokenProvider } from './auth/token-provider';

export interface RequestOptions extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>;
}

/**
 * HTTP client with automatic token refresh using native fetch
 */
export class HttpClient {
  private isRefreshing = false;
  private refreshPromise: Promise<void> | null = null;

  constructor(
    private baseUrl: string,
    private tokenProvider: TokenProvider
  ) {}

  /**
   * Make an HTTP request with automatic token refresh on 401
   */
  async request(url: string, options: RequestOptions = {}): Promise<Response> {
    const token = await this.tokenProvider.getAccessToken();

    const response = await fetch(`${this.baseUrl}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    // Handle 401 with automatic refresh
    if (response.status === 401 && !options.headers?.['X-Retry']) {
      await this.handleTokenRefresh();

      // Retry with new token
      const newToken = await this.tokenProvider.getAccessToken();
      return fetch(`${this.baseUrl}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
          ...(newToken && { Authorization: `Bearer ${newToken}` }),
          'X-Retry': 'true', // Prevent infinite loops
        },
      });
    }

    return response;
  }

  /**
   * Handle token refresh with concurrent request protection
   */
  private async handleTokenRefresh(): Promise<void> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performRefresh();

    try {
      await this.refreshPromise;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Perform the actual token refresh
   */
  private async performRefresh(): Promise<void> {
    try {
      await this.tokenProvider.refreshToken();
    } catch (error) {
      if (this.tokenProvider.onRefreshError) {
        this.tokenProvider.onRefreshError(error as Error);
      }
      throw error;
    }
  }

  /**
   * Convenience methods for common HTTP verbs
   */
  async get(url: string, options?: RequestOptions): Promise<Response> {
    return this.request(url, { ...options, method: 'GET' });
  }

  async post(
    url: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<Response> {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : null,
    });
  }

  async put(
    url: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<Response> {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : null,
    });
  }

  async delete(url: string, options?: RequestOptions): Promise<Response> {
    return this.request(url, { ...options, method: 'DELETE' });
  }
}
