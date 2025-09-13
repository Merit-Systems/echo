import { ApiKeyTokenProvider, TokenProvider } from './auth/token-provider';
import { EchoClientConfig, getConfig } from './config';
import { HttpClient } from './http-client';
import {
  AppsResource,
  AudioResource,
  BalanceResource,
  ModelsResource,
  PaymentsResource,
  UsersResource,
} from './resources';

export interface EchoClientOptions extends Partial<EchoClientConfig> {
  tokenProvider?: TokenProvider;
}

export class EchoClient {
  private http: HttpClient;
  private config: EchoClientConfig;
  private tokenProvider: TokenProvider;

  // Resource instances
  public readonly audio: AudioResource;
  public readonly balance: BalanceResource;
  public readonly payments: PaymentsResource;
  public readonly apps: AppsResource;
  public readonly users: UsersResource;
  public readonly models: ModelsResource;

  constructor(options?: EchoClientOptions) {
    this.config = getConfig(options);

    // Set up token provider
    if (options?.tokenProvider) {
      this.tokenProvider = options.tokenProvider;
    } else {
      // Fallback to API key provider
      const apiKey = this.config.apiKey || process.env.ECHO_API_KEY;
      if (!apiKey) {
        throw new Error('No API key or token provider provided');
      }
      this.tokenProvider = new ApiKeyTokenProvider(apiKey);
    }

    // Create fetch-based HTTP client with automatic token refresh
    this.http = new HttpClient(this.config.baseUrl, this.tokenProvider);

    // Initialize resource instances
    this.audio = new AudioResource(this.http);
    this.balance = new BalanceResource(this.http);
    this.payments = new PaymentsResource(this.http);
    this.apps = new AppsResource(this.http, this.config.baseUrl);
    this.users = new UsersResource(this.http);
    this.models = new ModelsResource(this.http);
  }
}
