import axios, { AxiosInstance, AxiosError } from 'axios';
import { EchoConfig, getConfig } from './config';
import { getStoredApiKey } from './auth';
import {
  Balance,
  CreatePaymentLinkRequest,
  CreatePaymentLinkResponse,
  EchoApp,
  ListEchoAppsResponse,
} from './types';

export class EchoClient {
  private http: AxiosInstance;
  private config: EchoConfig;

  constructor(config?: Partial<EchoConfig>) {
    this.config = getConfig(config);
    this.http = axios.create({
      baseURL: this.config.baseUrl,
      timeout: 30000,
    });

    // Add request interceptor to include API key
    this.http.interceptors.request.use(async (config) => {
      const apiKey = this.config.apiKey || await getStoredApiKey();
      if (apiKey) {
        config.headers['Authorization'] = `Bearer ${apiKey}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.http.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          throw new Error('Invalid or expired API key. Please run "echo-cli login" to authenticate.');
        }
        throw error;
      }
    );
  }

  /**
   * Get current balance for the authenticated user
   * @param echoAppId Optional app ID to get balance for specific app
   */
  async getBalance(echoAppId?: string): Promise<Balance> {
    try {
      const params = echoAppId ? { echoAppId } : {};
      const response = await this.http.get('/api/balance', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch balance');
    }
  }

  /**
   * Create a payment link for purchasing credits
   * @param request Payment link details
   */
  async createPaymentLink(request: CreatePaymentLinkRequest): Promise<CreatePaymentLinkResponse> {
    try {
      const response = await this.http.post('/api/stripe/payment-link', request);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to create payment link');
    }
  }

  /**
   * Get payment URL for purchasing credits
   * @param amount Amount to purchase in USD
   * @param echoAppId App ID to associate the purchase with
   * @param description Optional description for the payment
   */
  async getPaymentUrl(amount: number, echoAppId: string, description?: string): Promise<string> {
    const response = await this.createPaymentLink({
      amount,
      echoAppId,
      description: description || 'Echo Credits',
    });
    return response.paymentLink.url;
  }

  /**
   * Get app URL for a specific Echo app
   * @param appId The Echo app ID
   */
  getAppUrl(appId: string): string {
    return `${this.config.baseUrl}/apps/${appId}`;
  }

  /**
   * List all Echo apps for the authenticated user
   */
  async listEchoApps(): Promise<EchoApp[]> {
    try {
      const response = await this.http.get<ListEchoAppsResponse>('/api/echo-apps');
      return response.data.echoApps;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch Echo apps');
    }
  }

  /**
   * Get a specific Echo app by ID
   * @param appId The Echo app ID
   */
  async getEchoApp(appId: string): Promise<EchoApp> {
    try {
      const response = await this.http.get(`/api/echo-apps/${appId}`);
      return response.data.echoApp;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch Echo app');
    }
  }

  private handleError(error: any, message: string): Error {
    if (error.response?.data?.error) {
      return new Error(`${message}: ${error.response.data.error}`);
    }
    if (error.message) {
      return new Error(`${message}: ${error.message}`);
    }
    return new Error(message);
  }
} 