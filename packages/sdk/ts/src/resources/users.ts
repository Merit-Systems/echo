import { HttpClient } from '../http-client';
import { ApiRoutes } from '../api-types';
import { BaseResource } from '../utils/error-handling';
import { validateAppId } from '../utils/validation';

export class UsersResource extends BaseResource {
  constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Get current user information
   */
  async getUserInfo(): Promise<ApiRoutes['GET /user']['response']> {
    return this.handleRequest(
      () => this.http.get('/api/v1/user'),
      'fetching user info',
      '/api/v1/user'
    );
  }

  /**
   * Register a referral code for the authenticated user
   * @param echoAppId The Echo app ID to register the referral code for
   * @param code The referral code to register
   */
  async registerReferralCode(echoAppId: string, code: string) {
    validateAppId(echoAppId, 'registerReferralCode');

    const request: ApiRoutes['POST /user/referral']['body'] = {
      echoAppId,
      code,
    };
    return this.handleRequest<ApiRoutes['POST /user/referral']['response']>(
      () => this.http.post('/api/v1/user/referral', request),
      'registering referral code',
      '/api/v1/user/referral'
    );
  }
}
