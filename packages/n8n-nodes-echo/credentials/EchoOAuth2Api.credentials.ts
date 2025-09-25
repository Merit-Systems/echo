import type { Icon, ICredentialType, INodeProperties } from 'n8n-workflow';

export class EchoOAuth2Api implements ICredentialType {
  name = 'echoOAuth2Api';

  extends = ['oAuth2Api'];

  displayName = 'Echo OAuth2 API';

  icon: Icon = 'file:../icons/github.svg';

  documentationUrl = 'https://echo.merit.systems/docs';

  properties: INodeProperties[] = [
    {
      displayName: 'Grant Type',
      name: 'grantType',
      type: 'hidden',
      default: 'pkce',
    },
    {
      displayName: 'Echo Base URL',
      name: 'baseUrl',
      type: 'hidden',
      default: 'https://echo.router.merit.systems',
      required: false,
      description: 'The base URL for your Echo instance',
    },
    {
      displayName: 'Authorization URL',
      name: 'authUrl',
      type: 'hidden',
      default: 'https://echo.merit.systems/api/oauth/authorize',
      required: true,
    },
    {
      displayName: 'Access Token URL',
      name: 'accessTokenUrl',
      type: 'hidden',
      default: 'https://echo.merit.systems/api/oauth/token',
      required: true,
    },
    {
      displayName: 'Scope',
      name: 'scope',
      type: 'hidden',
      default: 'llm:invoke offline_access',
      description:
        'OAuth2 scopes separated by spaces. Default includes LLM invocation and refresh token access.',
    },
    {
      displayName: 'Client ID',
      name: 'clientId',
      type: 'string',
      default: '1cf92670-39b3-422f-8a9f-86ee7bee5556',
      required: true,
      description: 'The Echo App ID for your application',
    },
    {
      displayName: 'Client Secret',
      name: 'clientSecret',
      type: 'hidden',
      typeOptions: {
        password: true,
      },
      default: '',
      required: false,
      description:
        'Not required for Echo OAuth2. Echo uses PKCE (Proof Key for Code Exchange) for security instead of client secrets.',
    },
    {
      displayName: 'Auth URI Query Parameters',
      name: 'authQueryParameters',
      type: 'hidden',
      default: '',
    },
    {
      displayName: 'Authentication',
      name: 'authentication',
      type: 'hidden',
      default: 'header',
    },
  ];
}
