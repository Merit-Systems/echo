import type { OAuth2Config, OAuthUserConfig } from '@auth/core/providers';

export interface EchoUser {
  sub: string;
  name: string;
  email: string;
  picture?: string;
}

/**
 * UUID v4 regex pattern
 */
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validates that an Echo App ID is a valid UUID v4
 * @param appId - The app ID to validate
 * @param context - Optional context for the error message
 * @throws Error if the app ID is invalid
 */
function validateAppId(appId: string, context?: string): void {
  if (!appId || typeof appId !== 'string') {
    throw new Error(
      `Invalid Echo App ID${context ? ` in ${context}` : ''}: App ID must be a non-empty string. Received: ${typeof appId === 'string' ? `"${appId}"` : typeof appId}`
    );
  }

  if (!UUID_REGEX.test(appId)) {
    throw new Error(
      `Invalid Echo App ID${context ? ` in ${context}` : ''}: App ID must be a valid UUID v4 format. Received: "${appId}". Expected format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx (e.g., "60601628-cdb7-481e-8f7e-921981220348")`
    );
  }
}

/**
 * Add Echo login to your page.
 *
 * ### Setup
 *
 * #### Callback URL
 * ```
 * https://example.com/api/auth/callback/echo
 * ```
 *
 * #### Configuration
 *```ts
 * import { Auth } from "@auth/core"
 * import Echo from "@merit/echo-authjs-provider"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Echo({
 *       appId: ECHO_APP_ID,
 *     }),
 *   ],
 * })
 * ```
 *
 *
 */
export default function Echo(
  config: OAuthUserConfig<EchoUser> & {
    appId: string;
  }
): OAuth2Config<EchoUser> {
  validateAppId(config.appId, 'Echo (auth-js-provider)');

  const baseUrl = 'https://echo.merit.systems';
  return {
    id: 'echo',
    name: 'Echo',
    type: 'oauth',

    clientId: config.appId,

    authorization: {
      url: `${baseUrl}/api/oauth/authorize`,
      params: {
        scope: 'llm:invoke offline_access',
      },
    },
    token: {
      url: `${baseUrl}/api/oauth/token`,
      params: {
        client_id: config.appId,
      },
    },
    userinfo: `${baseUrl}/api/oauth/userinfo`,
    profile: profile => {
      return {
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.picture || null,
      };
    },
    client: {
      token_endpoint_auth_method: 'none',
    },
    options: config,
  };
}
