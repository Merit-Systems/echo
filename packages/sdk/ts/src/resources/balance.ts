import { HttpClient } from '../http-client';
import { Balance, FreeBalance, GetFreeBalanceRequest } from '../types';
import { BaseResource } from '../utils/error-handling';

export class BalanceResource extends BaseResource {
  constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Get current balance for the authenticated user across all apps
   */
  async getBalance(): Promise<Balance> {
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
  async getFreeBalance(echoAppId: string): Promise<FreeBalance> {
    const request: GetFreeBalanceRequest = { echoAppId };
    return this.handleRequest(
      () => this.http.post('/api/v1/balance/free', request),
      'fetching free tier balance',
      '/api/v1/balance/free'
    );
  }
}
