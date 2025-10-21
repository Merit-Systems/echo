import { HttpClient } from '../http-client';
import { ApiRoutes } from '../api-types';
import { BaseResource } from '../utils/error-handling';
import { validateAppId } from '../utils/validation';

export class BalanceResource extends BaseResource {
  constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Get current balance for the authenticated user across all apps
   */
  async getBalance(): Promise<ApiRoutes['GET /balance']['response']> {
    return this.handleRequest(
      () => this.http.get('/api/v1/balance'),
      'fetching balance',
      '/api/v1/balance'
    );
  }

  /**
   * Get free tier balance for a specific app
   * @param echoAppId The Echo app ID to get free tier balance for
   */
  async getFreeBalance(
    echoAppId: string
  ): Promise<ApiRoutes['GET /balance/{id}/free']['response']> {
    validateAppId(echoAppId, 'getFreeBalance');

    return this.handleRequest(
      () => this.http.get(`/api/v1/balance/${echoAppId}/free`),
      'fetching free tier balance',
      '/api/v1/balance/free'
    );
  }
}
