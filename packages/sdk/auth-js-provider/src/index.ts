import type { OAuth2Config, OAuthUserConfig } from '@auth/core/providers';

export interface EchoUser {
  sub: string;
  name: string;
  email: string;
  picture?: string;
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
 *       clientId: ECHO_CLIENT_ID,
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
    options: config,
  };
}
