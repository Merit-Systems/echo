import { ChatOpenAI, type ClientOptions } from '@langchain/openai';
import type {
  INodeType,
  INodeTypeDescription,
  ISupplyDataFunctions,
  SupplyData,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

interface IEchoCredentials {
  apiKey: string;
  appId: string;
  baseUrl: string;
}

interface IEchoOAuth2Credentials {
  baseUrl?: string;
  oauthTokenData?: {
    access_token: string;
    token_type?: string;
    expires_in?: number;
    refresh_token?: string;
  };
  // Alternative property names that might contain the token
  access_token?: string;
  accessToken?: string;
  token?: string;
}

export class LmChatEcho implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Echo Chat Model',
    name: 'lmChatEcho',
    icon: 'file:../../icons/logo/light.svg',
    group: ['transform'],
    version: 1,
    description: 'For advanced usage with an AI chain using Echo API',
    defaults: {
      name: 'Echo Chat Model',
    },
    codex: {
      categories: ['AI'],
      subcategories: {
        AI: ['Language Models', 'Root Nodes'],
        'Language Models': ['Chat Models (Recommended)'],
      },
      resources: {
        primaryDocumentation: [
          {
            url: 'https://echo.merit.systems/docs',
          },
        ],
      },
    },
    inputs: [],
    outputs: ['ai_languageModel'],
    outputNames: ['Model'],
    credentials: [
      {
        name: 'echoApi',
        required: true,
        displayOptions: {
          show: {
            authentication: ['echoApi'],
          },
        },
      },
      {
        name: 'echoOAuth2Api',
        required: true,
        displayOptions: {
          show: {
            authentication: ['echoOAuth2Api'],
          },
        },
      },
    ],
    properties: [
      {
        displayName: 'Authentication',
        name: 'authentication',
        type: 'options',
        options: [
          {
            name: 'OAuth2',
            value: 'echoOAuth2Api',
          },
          {
            name: 'API Key',
            value: 'echoApi',
          },
        ],
        default: 'echoOAuth2Api',
      },
      {
        displayName: 'Model',
        name: 'model',
        type: 'string',
        required: true,
        default: 'gpt-4o',
        description:
          'The model to use for the chat completion (e.g., gpt-4o, claude-3-5-sonnet-20240620)',
        placeholder: 'gpt-4o',
      },
      {
        displayName: 'Options',
        name: 'options',
        placeholder: 'Add Option',
        description: 'Additional options to add',
        type: 'collection',
        default: {},
        options: [
          {
            displayName: 'Frequency Penalty',
            name: 'frequencyPenalty',
            default: 0,
            typeOptions: { maxValue: 2, minValue: -2, numberPrecision: 1 },
            description:
              "Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim",
            type: 'number',
          },
          {
            displayName: 'Max Retries',
            name: 'maxRetries',
            default: 2,
            description: 'Maximum number of retries to attempt',
            type: 'number',
          },
          {
            displayName: 'Maximum Number of Tokens',
            name: 'maxTokens',
            default: -1,
            description:
              'The maximum number of tokens to generate in the completion',
            type: 'number',
            typeOptions: {
              maxValue: 32768,
            },
          },
          {
            displayName: 'Presence Penalty',
            name: 'presencePenalty',
            default: 0,
            typeOptions: { maxValue: 2, minValue: -2, numberPrecision: 1 },
            description:
              "Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics",
            type: 'number',
          },
          {
            displayName: 'Sampling Temperature',
            name: 'temperature',
            default: 0.7,
            typeOptions: { maxValue: 2, minValue: 0, numberPrecision: 1 },
            description:
              'Controls randomness: Lowering results in less random completions. As the temperature approaches zero, the model will become deterministic and repetitive.',
            type: 'number',
          },
          {
            displayName: 'Timeout',
            name: 'timeout',
            default: 60000,
            description:
              'Maximum amount of time a request is allowed to take in milliseconds',
            type: 'number',
          },
          {
            displayName: 'Top P',
            name: 'topP',
            default: 1,
            typeOptions: { maxValue: 1, minValue: 0, numberPrecision: 1 },
            description:
              'Controls diversity via nucleus sampling: 0.5 means half of all likelihood-weighted options are considered. We generally recommend altering this or temperature but not both.',
            type: 'number',
          },
        ],
      },
    ],
  };

  async supplyData(
    this: ISupplyDataFunctions,
    itemIndex: number
  ): Promise<SupplyData> {
    const authenticationMethod = this.getNodeParameter(
      'authentication',
      itemIndex
    ) as string;

    let apiKey: string;
    let baseUrl: string;

    if (authenticationMethod === 'echoApi') {
      // Use API key authentication
      const credentials = (await this.getCredentials(
        'echoApi'
      )) as IEchoCredentials;
      apiKey = credentials.apiKey;
      baseUrl = credentials.baseUrl || 'https://echo.router.merit.systems';
    } else {
      // Use OAuth2 authentication
      const credentials = (await this.getCredentials(
        'echoOAuth2Api'
      )) as IEchoOAuth2Credentials;

      // Debug: Log available credential properties (without exposing sensitive data)
      if (process.env.NODE_ENV === 'development') {
        console.log('OAuth2 credential structure:', {
          hasOauthTokenData: !!credentials.oauthTokenData,
          hasAccessToken: !!credentials.access_token,
          hasAccessTokenProp: !!credentials.accessToken,
          hasToken: !!credentials.token,
          oauthTokenDataKeys: credentials.oauthTokenData
            ? Object.keys(credentials.oauthTokenData)
            : [],
          credentialKeys: Object.keys(credentials),
        });
      }

      // OAuth2 credentials can contain the access token in various properties
      const token =
        credentials.oauthTokenData?.access_token ||
        credentials.access_token ||
        credentials.accessToken ||
        credentials.token;

      if (!token) {
        const errorMsg =
          'OAuth2 access token not found in credentials. ' +
          'Available properties: ' +
          Object.keys(credentials).join(', ') +
          (credentials.oauthTokenData
            ? '. OAuth token data properties: ' +
              Object.keys(credentials.oauthTokenData).join(', ')
            : '. No oauthTokenData found') +
          '. Please re-authenticate.';
        throw new NodeOperationError(this.getNode(), errorMsg);
      }

      apiKey = token;

      baseUrl = credentials.baseUrl || 'https://echo.router.merit.systems';
    }

    const modelName = this.getNodeParameter('model', itemIndex) as string;

    const options = this.getNodeParameter('options', itemIndex, {}) as {
      frequencyPenalty?: number;
      maxTokens?: number;
      maxRetries: number;
      timeout: number;
      presencePenalty?: number;
      temperature?: number;
      topP?: number;
    };

    const configuration: ClientOptions = {};
    configuration.baseURL = baseUrl;

    const model = new ChatOpenAI({
      apiKey: apiKey,
      configuration: { baseURL: configuration.baseURL },
      model: modelName,
      ...options,
      timeout: options.timeout ?? 60000,
      maxRetries: options.maxRetries ?? 2,
    });

    return {
      response: model,
    };
  }
}
