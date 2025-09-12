import { HttpClient } from '../http-client';
import { EchoApp, ListEchoAppsResponse } from '../types';
import { BaseResource } from '../utils/error-handling';

export class AppsResource extends BaseResource {
  constructor(
    http: HttpClient,
    private baseUrl: string
  ) {
    super(http);
  }

  /**
   * List all Echo apps for the authenticated user
   */
  async listEchoApps(): Promise<EchoApp[]> {
    const response = await this.handleRequest<ListEchoAppsResponse>(
      () => this.http.get('/api/v1/apps'),
      'listing Echo apps',
      '/api/v1/apps'
    );
    return response.apps;
  }

  /**
   * Get a specific Echo app by ID
   * @param appId The Echo app ID
   */
  async getEchoApp(appId: string): Promise<EchoApp> {
    return this.handleRequest<EchoApp>(
      () => this.http.get(`/api/v1/apps/${appId}`),
      'fetching Echo app',
      `/api/v1/apps/${appId}`
    );
  }

  /**
   * Get app URL for a specific Echo app
   * @param appId The Echo app ID
   */
  getAppUrl(appId: string): string {
    return `${this.baseUrl}/apps/${appId}`;
  }
}
