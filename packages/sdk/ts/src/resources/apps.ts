import { HttpClient } from '../http-client';
import { ApiRoutes } from '../api-types';
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
  async listEchoApps(query?: ApiRoutes['GET /apps']['query']) {
    const response = await this.handleRequest<
      ApiRoutes['GET /apps']['response']
    >(
      () => this.http.get('/api/v1/apps', query),
      'listing Echo apps',
      '/api/v1/apps'
    );
    return response;
  }

  /**
   * Get a specific Echo app by ID
   * @param appId The Echo app ID
   */
  async getEchoApp(
    appId: string
  ): Promise<ApiRoutes['GET /apps/{id}']['response']> {
    return this.handleRequest<ApiRoutes['GET /apps/{id}']['response']>(
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
    return `${this.baseUrl}/app/${appId}`;
  }
}
