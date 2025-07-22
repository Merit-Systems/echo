import axios from 'axios';
import { vi } from 'vitest';

import { EchoClient } from '../client';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

const TEST_SERVER_URL = 'http://localhost:3001';
const TEST_API_KEY = 'echo_test_api_key_12345';

interface ErrorWithResponse extends Error {
  response?: {
    status: number;
    data?: unknown;
  };
  code?: string;
}

describe('EchoClient', () => {
  let client: EchoClient;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockAxiosInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock axios instance
    mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      interceptors: {
        request: {
          use: vi.fn(),
        },
        response: {
          use: vi.fn(),
        },
      },
      defaults: {
        timeout: 30000,
      },
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    client = new EchoClient({
      baseUrl: TEST_SERVER_URL,
      apiKey: TEST_API_KEY,
    });
  });

  describe('Authentication', () => {
    it('should include Authorization header in requests', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: { totalPaid: 100, totalSpent: 0, balance: 100 },
      });

      await client.getBalance();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v1/balance');
    });

    it('should handle authentication errors', async () => {
      const error = new Error('Authentication failed') as ErrorWithResponse;
      error.response = { status: 401 };
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(client.getBalance()).rejects.toThrow();
    });
  });

  describe('getBalance', () => {
    it('should fetch total balance across all apps successfully', async () => {
      const mockBalance = {
        balance: 75.5,
        totalPaid: 100.0,
        totalSpent: 24.5,
      };

      mockAxiosInstance.get.mockResolvedValue({ data: mockBalance });

      const balance = await client.getBalance();

      expect(balance).toEqual(mockBalance);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v1/balance');
    });

    it('should handle balance fetch errors', async () => {
      const error = new Error('Network error');
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(client.getBalance()).rejects.toThrow(
        'Failed to fetch balance'
      );
    });
  });

  describe('createPaymentLink', () => {
    it('should create payment link successfully', async () => {
      const paymentRequest = {
        amount: 50.0,
        description: 'Test payment',
      };

      const mockResponse = {
        paymentLink: {
          id: 'link_123',
          url: 'https://checkout.stripe.com/pay/cs_test_123',
          amount: 50.0,
          currency: 'usd',
          description: 'Test payment',
        },
      };

      mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });

      const response = await client.createPaymentLink(paymentRequest);

      expect(response).toEqual(mockResponse);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/api/v1/stripe/payment-link',
        paymentRequest
      );
    });

    it('should create payment link without description', async () => {
      const paymentRequest = {
        amount: 25.0,
      };

      const mockResponse = {
        paymentLink: {
          id: 'link_456',
          url: 'https://checkout.stripe.com/pay/cs_test_456',
          amount: 25.0,
          currency: 'usd',
        },
      };

      mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });

      const response = await client.createPaymentLink(paymentRequest);

      expect(response).toEqual(mockResponse);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/api/v1/stripe/payment-link',
        paymentRequest
      );
    });

    it('should create payment link with success URL', async () => {
      const paymentRequest = {
        amount: 75.0,
        description: 'Test payment with success URL',
        successUrl: 'https://myapp.com/payment/success',
      };

      const mockResponse = {
        paymentLink: {
          id: 'link_callbacks',
          url: 'https://checkout.stripe.com/pay/cs_test_callbacks',
          amount: 75.0,
          currency: 'usd',
          description: 'Test payment with success URL',
        },
      };

      mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });

      const response = await client.createPaymentLink(paymentRequest);

      expect(response).toEqual(mockResponse);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/api/v1/stripe/payment-link',
        paymentRequest
      );
    });

    it('should create payment link with only success URL', async () => {
      const paymentRequest = {
        amount: 30.0,
        description: 'Test payment with success URL only',
        successUrl: 'https://myapp.com/payment/success',
      };

      const mockResponse = {
        paymentLink: {
          id: 'link_success_only',
          url: 'https://checkout.stripe.com/pay/cs_test_success_only',
          amount: 30.0,
          currency: 'usd',
          description: 'Test payment with success URL only',
        },
      };

      mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });

      const response = await client.createPaymentLink(paymentRequest);

      expect(response).toEqual(mockResponse);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/api/v1/stripe/payment-link',
        paymentRequest
      );
    });

    it('should handle payment creation errors', async () => {
      const paymentRequest = {
        amount: -10.0,
        description: 'Invalid amount',
      };

      const error = new Error('Invalid amount');
      mockAxiosInstance.post.mockRejectedValue(error);

      await expect(client.createPaymentLink(paymentRequest)).rejects.toThrow(
        'Failed to create payment link'
      );
    });
  });

  describe('getPaymentUrl', () => {
    it('should generate payment URL', async () => {
      const amount = 100.0;
      const description = 'Test payment URL';

      const mockResponse = {
        paymentLink: {
          id: 'link_789',
          url: 'https://checkout.stripe.com/pay/cs_test_789',
          amount: 100.0,
          currency: 'usd',
          description: 'Test payment URL',
        },
      };

      mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });

      const url = await client.getPaymentUrl(amount, description);

      expect(url).toBe(mockResponse.paymentLink.url);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/api/v1/stripe/payment-link',
        {
          amount,
          description,
        }
      );
    });

    it('should generate payment URL without description', async () => {
      const amount = 50.0;

      const mockResponse = {
        paymentLink: {
          id: 'link_default',
          url: 'https://checkout.stripe.com/pay/cs_test_default',
          amount: 50.0,
          currency: 'usd',
          description: 'Echo Credits',
        },
      };

      mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });

      const url = await client.getPaymentUrl(amount);

      expect(url).toBe(mockResponse.paymentLink.url);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/api/v1/stripe/payment-link',
        {
          amount,
          description: 'Echo Credits',
        }
      );
    });

    it('should generate payment URL with success URL', async () => {
      const amount = 150.0;
      const description = 'Premium Credits';
      const successUrl = 'https://myapp.com/success';

      const mockResponse = {
        paymentLink: {
          id: 'link_with_success',
          url: 'https://checkout.stripe.com/pay/cs_test_with_success',
          amount: 150.0,
          currency: 'usd',
          description: 'Premium Credits',
        },
      };

      mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });

      const url = await client.getPaymentUrl(amount, description, successUrl);

      expect(url).toBe(mockResponse.paymentLink.url);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/api/v1/stripe/payment-link',
        {
          amount,
          description,
          successUrl,
        }
      );
    });

    it('should generate payment URL with only success URL', async () => {
      const amount = 75.0;
      const description = 'Standard Credits';
      const successUrl = 'https://myapp.com/payment-complete';

      const mockResponse = {
        paymentLink: {
          id: 'link_success_only_url',
          url: 'https://checkout.stripe.com/pay/cs_test_success_only_url',
          amount: 75.0,
          currency: 'usd',
          description: 'Standard Credits',
        },
      };

      mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });

      const url = await client.getPaymentUrl(amount, description, successUrl);

      expect(url).toBe(mockResponse.paymentLink.url);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/api/v1/stripe/payment-link',
        {
          amount,
          description,
          successUrl,
        }
      );
    });

    it('should generate payment URL with undefined success URL (should not include it)', async () => {
      const amount = 25.0;
      const description = 'Basic Credits';

      const mockResponse = {
        paymentLink: {
          id: 'link_no_success_url',
          url: 'https://checkout.stripe.com/pay/cs_test_no_success_url',
          amount: 25.0,
          currency: 'usd',
          description: 'Basic Credits',
        },
      };

      mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });

      const url = await client.getPaymentUrl(amount, description, undefined);

      expect(url).toBe(mockResponse.paymentLink.url);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/api/v1/stripe/payment-link',
        {
          amount,
          description,
        }
      );
    });
  });

  describe('listEchoApps', () => {
    it('should list Echo apps successfully', async () => {
      const mockApps = [
        {
          id: 'app1',
          name: 'Test App 1',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          userId: 'user1',
        },
        {
          id: 'app2',
          name: 'Test App 2',
          createdAt: '2024-01-02',
          updatedAt: '2024-01-02',
          userId: 'user1',
        },
      ];

      mockAxiosInstance.get.mockResolvedValue({ data: { apps: mockApps } });

      const apps = await client.listEchoApps();

      expect(apps).toEqual(mockApps);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v1/apps');
    });

    it('should handle empty app list', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: { apps: [] } });

      const apps = await client.listEchoApps();

      expect(apps).toEqual([]);
      expect(Array.isArray(apps)).toBe(true);
    });
  });

  describe('getEchoApp', () => {
    it('should fetch specific Echo app', async () => {
      const mockApp = {
        id: 'app1',
        name: 'Test App',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        userId: 'user1',
      };

      mockAxiosInstance.get.mockResolvedValue({ data: mockApp });

      const app = await client.getEchoApp('app1');

      expect(app).toEqual(mockApp);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v1/apps/app1');
    });

    it('should handle non-existent app', async () => {
      const error = new Error('Not found') as ErrorWithResponse;
      error.response = { status: 404, data: { error: 'Echo app not found' } };
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(client.getEchoApp('nonexistent')).rejects.toThrow(
        'Failed to fetch Echo app'
      );
    });
  });

  describe('getUserInfo', () => {
    it('should fetch user information successfully', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        totalPaid: 100,
        totalSpent: 50,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      mockAxiosInstance.get.mockResolvedValue({ data: mockUser });

      const user = await client.getUserInfo();

      expect(user).toEqual(mockUser);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v1/user');
    });

    it('should handle user info fetch errors', async () => {
      const error = new Error('Network error');
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(client.getUserInfo()).rejects.toThrow(
        'Failed to fetch user info'
      );
    });

    it('should handle user not found errors', async () => {
      const error = new Error('Not found') as ErrorWithResponse;
      error.response = { status: 404, data: { error: 'User not found' } };
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(client.getUserInfo()).rejects.toThrow(
        'Failed to fetch user info: User not found'
      );
    });
  });

  describe('getAppUrl', () => {
    it('should generate correct app URL', async () => {
      const appId = 'test-app-123';
      const expectedUrl = `${TEST_SERVER_URL}/apps/${appId}`;

      const url = client.getAppUrl(appId);

      expect(url).toBe(expectedUrl);
    });

    it('should handle special characters in app ID', async () => {
      const appId = 'test-app-with-special-chars_123';
      const expectedUrl = `${TEST_SERVER_URL}/apps/${appId}`;

      const url = client.getAppUrl(appId);

      expect(url).toBe(expectedUrl);
    });
  });

  describe('getSupportedModels', () => {
    const mockSupportedModelsResponse = {
      models: [
        {
          name: 'gpt-4',
          provider: 'openai',
          pricing: {
            input_cost_per_token: 0.00003,
            output_cost_per_token: 0.00006,
          },
          limits: {
            max_tokens: 4096,
            max_input_tokens: 8192,
            max_output_tokens: 4096,
          },
          capabilities: {
            mode: 'chat',
            supports_function_calling: true,
            supports_system_messages: true,
            supports_native_streaming: true,
          },
          metadata: {
            supported_endpoints: ['chat/completions'],
            tool_use_system_prompt_tokens: 10,
          },
        },
        {
          name: 'claude-3-opus',
          provider: 'anthropic',
          pricing: {
            input_cost_per_token: 0.000015,
            output_cost_per_token: 0.000075,
          },
          limits: {
            max_tokens: 4096,
            max_input_tokens: 200000,
            max_output_tokens: 4096,
          },
          capabilities: {
            mode: 'chat',
            supports_function_calling: true,
            supports_system_messages: true,
            supports_native_streaming: true,
          },
          metadata: {
            supported_endpoints: ['messages'],
            tool_use_system_prompt_tokens: 8,
          },
        },
      ],
      models_by_provider: {
        openai: [
          {
            name: 'gpt-4',
            provider: 'openai',
            pricing: {
              input_cost_per_token: 0.00003,
              output_cost_per_token: 0.00006,
            },
            limits: {
              max_tokens: 4096,
              max_input_tokens: 8192,
              max_output_tokens: 4096,
            },
            capabilities: {
              mode: 'chat',
              supports_function_calling: true,
              supports_system_messages: true,
              supports_native_streaming: true,
            },
            metadata: {
              supported_endpoints: ['chat/completions'],
              tool_use_system_prompt_tokens: 10,
            },
          },
        ],
        anthropic: [
          {
            name: 'claude-3-opus',
            provider: 'anthropic',
            pricing: {
              input_cost_per_token: 0.000015,
              output_cost_per_token: 0.000075,
            },
            limits: {
              max_tokens: 4096,
              max_input_tokens: 200000,
              max_output_tokens: 4096,
            },
            capabilities: {
              mode: 'chat',
              supports_function_calling: true,
              supports_system_messages: true,
              supports_native_streaming: true,
            },
            metadata: {
              supported_endpoints: ['messages'],
              tool_use_system_prompt_tokens: 8,
            },
          },
        ],
      },
    };

    it('should fetch supported models successfully', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: mockSupportedModelsResponse,
      });

      const response = await client.getSupportedModels();

      expect(response).toEqual(mockSupportedModelsResponse);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/api/v1/supported-models'
      );
    });

    it('should handle supported models fetch errors', async () => {
      const error = new Error('Network error');
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(client.getSupportedModels()).rejects.toThrow(
        'Failed to fetch supported models'
      );
    });

    it('should handle API error responses for supported models', async () => {
      const apiError = new Error('API Error') as ErrorWithResponse;
      apiError.response = {
        status: 500,
        data: { error: 'Internal server error' },
      };
      mockAxiosInstance.get.mockRejectedValue(apiError);

      await expect(client.getSupportedModels()).rejects.toThrow(
        'Failed to fetch supported models: Internal server error'
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network Error');
      mockAxiosInstance.get.mockRejectedValue(networkError);

      await expect(client.getBalance()).rejects.toThrow(
        'Failed to fetch balance: Network Error'
      );
    });

    it('should handle 401 unauthorized errors', async () => {
      const authError = new Error('Unauthorized') as ErrorWithResponse;
      authError.response = { status: 401 };
      mockAxiosInstance.get.mockRejectedValue(authError);

      await expect(client.getBalance()).rejects.toThrow();
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('timeout of 30000ms exceeded') as Error & {
        code?: string;
      };
      timeoutError.code = 'ECONNABORTED';
      mockAxiosInstance.get.mockRejectedValue(timeoutError);

      await expect(client.getBalance()).rejects.toThrow(
        'Failed to fetch balance: timeout of 30000ms exceeded'
      );
    });

    it('should handle API error responses', async () => {
      const apiError = new Error('API Error') as ErrorWithResponse;
      apiError.response = { status: 400, data: { error: 'Invalid request' } };
      mockAxiosInstance.get.mockRejectedValue(apiError);

      await expect(client.getBalance()).rejects.toThrow(
        'Failed to fetch balance: Invalid request'
      );
    });
  });
});
