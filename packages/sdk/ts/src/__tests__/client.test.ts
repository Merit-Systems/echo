import { vi, type MockedFunction } from 'vitest';

import { EchoClient } from '../client';
import { EchoError } from '../utils/error-handling';

// Mock global fetch
const mockFetch = vi.fn() as MockedFunction<typeof fetch>;
global.fetch = mockFetch;

const TEST_SERVER_URL = 'http://localhost:3001';
const TEST_API_KEY = 'echo_test_api_key_12345';

// Helper to create mock Response
function createMockResponse(
  data: unknown,
  status = 200,
  statusText = 'OK'
): Response {
  const isOk = status >= 200 && status < 300;
  const textData = typeof data === 'string' ? data : JSON.stringify(data);

  return {
    ok: isOk,
    status,
    statusText,
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn().mockResolvedValue(textData),
    headers: new Headers(),
    redirected: false,
    type: 'basic',
    url: '',
    clone: vi.fn(),
    body: null,
    bodyUsed: false,
    arrayBuffer: vi.fn(),
    blob: vi.fn(),
    formData: vi.fn(),
    bytes: vi.fn(),
  } as unknown as Response;
}

describe('EchoClient', () => {
  let client: EchoClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();

    client = new EchoClient({
      baseUrl: TEST_SERVER_URL,
      apiKey: TEST_API_KEY,
    });
  });

  describe('Authentication', () => {
    it('should include Authorization header in requests', async () => {
      const mockData = { totalPaid: 100, totalSpent: 0, balance: 100 };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockData));

      await client.balance.getBalance();

      expect(mockFetch).toHaveBeenCalledWith(
        `${TEST_SERVER_URL}/api/v1/balance`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: `Bearer ${TEST_API_KEY}`,
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should handle authentication errors', async () => {
      const errorResponse = createMockResponse(
        { error: 'Authentication required. Please sign in again.' },
        401,
        'Unauthorized'
      );
      mockFetch.mockResolvedValue(errorResponse);

      const promise = client.balance.getBalance();

      await expect(promise).rejects.toThrow(EchoError);
      await expect(promise).rejects.toHaveProperty('code', 'HTTP_401');
    });
  });

  describe('getBalance', () => {
    it('should fetch total balance across all apps successfully', async () => {
      const mockBalance = {
        balance: 75.5,
        totalPaid: 100.0,
        totalSpent: 24.5,
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(mockBalance));

      const balance = await client.balance.getBalance();

      expect(balance).toEqual(mockBalance);
      expect(mockFetch).toHaveBeenCalledWith(
        `${TEST_SERVER_URL}/api/v1/balance`,
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should handle balance fetch errors', async () => {
      const networkError = new TypeError('Failed to fetch');
      mockFetch.mockRejectedValue(networkError);

      const promise = client.balance.getBalance();

      await expect(promise).rejects.toThrow(EchoError);
      await expect(promise).rejects.toHaveProperty('code', 'NETWORK_ERROR');
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

      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const response = await client.payments.createPaymentLink(paymentRequest);

      expect(response).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        `${TEST_SERVER_URL}/api/v1/stripe/payment-link`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(paymentRequest),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
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

      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const response = await client.payments.createPaymentLink(paymentRequest);

      expect(response).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        `${TEST_SERVER_URL}/api/v1/stripe/payment-link`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(paymentRequest),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
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

      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const response = await client.payments.createPaymentLink(paymentRequest);

      expect(response).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        `${TEST_SERVER_URL}/api/v1/stripe/payment-link`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(paymentRequest),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
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

      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const response = await client.payments.createPaymentLink(paymentRequest);

      expect(response).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        `${TEST_SERVER_URL}/api/v1/stripe/payment-link`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(paymentRequest),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should handle payment creation errors', async () => {
      const paymentRequest = {
        amount: -10.0,
        description: 'Invalid amount',
      };

      const errorResponse = createMockResponse(
        { error: 'Invalid amount' },
        400,
        'Bad Request'
      );
      mockFetch.mockResolvedValue(errorResponse);

      const promise = client.payments.createPaymentLink(paymentRequest);

      await expect(promise).rejects.toThrow(EchoError);
      await expect(promise).rejects.toHaveProperty('code', 'HTTP_400');
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

      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const url = await client.payments.getPaymentUrl(amount, description);

      expect(url).toBe(mockResponse.paymentLink.url);
      expect(mockFetch).toHaveBeenCalledWith(
        `${TEST_SERVER_URL}/api/v1/stripe/payment-link`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            amount,
            description,
          }),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
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

      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const url = await client.payments.getPaymentUrl(amount);

      expect(url).toBe(mockResponse.paymentLink.url);
      expect(mockFetch).toHaveBeenCalledWith(
        `${TEST_SERVER_URL}/api/v1/stripe/payment-link`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            amount,
            description: 'Echo Credits',
          }),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
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

      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const url = await client.payments.getPaymentUrl(
        amount,
        description,
        successUrl
      );

      expect(url).toBe(mockResponse.paymentLink.url);
      expect(mockFetch).toHaveBeenCalledWith(
        `${TEST_SERVER_URL}/api/v1/stripe/payment-link`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            amount,
            description,
            successUrl,
          }),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
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

      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const url = await client.payments.getPaymentUrl(
        amount,
        description,
        successUrl
      );

      expect(url).toBe(mockResponse.paymentLink.url);
      expect(mockFetch).toHaveBeenCalledWith(
        `${TEST_SERVER_URL}/api/v1/stripe/payment-link`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            amount,
            description,
            successUrl,
          }),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
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

      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const url = await client.payments.getPaymentUrl(
        amount,
        description,
        undefined
      );

      expect(url).toBe(mockResponse.paymentLink.url);
      expect(mockFetch).toHaveBeenCalledWith(
        `${TEST_SERVER_URL}/api/v1/stripe/payment-link`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            amount,
            description,
          }),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });
  });

  describe('listEchoApps', () => {
    it('should list Echo apps successfully', async () => {
      const mockApps = [
        {
          id: 'app1',
          name: 'Test App 1',
          isActive: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          userId: 'user1',
        },
        {
          id: 'app2',
          name: 'Test App 2',
          isActive: false,
          createdAt: '2024-01-02',
          updatedAt: '2024-01-02',
          userId: 'user1',
        },
      ];

      mockFetch.mockResolvedValueOnce(createMockResponse({ apps: mockApps }));

      const apps = await client.apps.listEchoApps();

      expect(apps).toEqual(mockApps);
      expect(mockFetch).toHaveBeenCalledWith(
        `${TEST_SERVER_URL}/api/v1/apps`,
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should handle empty app list', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ apps: [] }));

      const apps = await client.apps.listEchoApps();

      expect(apps).toEqual([]);
      expect(Array.isArray(apps)).toBe(true);
    });
  });

  describe('getEchoApp', () => {
    it('should fetch specific Echo app', async () => {
      const mockApp = {
        id: 'app1',
        name: 'Test App',
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        userId: 'user1',
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(mockApp));

      const app = await client.apps.getEchoApp('app1');

      expect(app).toEqual(mockApp);
      expect(mockFetch).toHaveBeenCalledWith(
        `${TEST_SERVER_URL}/api/v1/apps/app1`,
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should handle non-existent app', async () => {
      const errorResponse = createMockResponse(
        { error: 'Echo app not found' },
        404,
        'Not Found'
      );
      mockFetch.mockResolvedValue(errorResponse);

      const promise = client.apps.getEchoApp('nonexistent');

      await expect(promise).rejects.toThrow(EchoError);
      await expect(promise).rejects.toHaveProperty('code', 'HTTP_404');
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

      mockFetch.mockResolvedValueOnce(createMockResponse(mockUser));

      const user = await client.users.getUserInfo();

      expect(user).toEqual(mockUser);
      expect(mockFetch).toHaveBeenCalledWith(
        `${TEST_SERVER_URL}/api/v1/user`,
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should handle user info fetch errors', async () => {
      const networkError = new TypeError('Failed to fetch');
      mockFetch.mockRejectedValue(networkError);

      const promise = client.users.getUserInfo();

      await expect(promise).rejects.toThrow(EchoError);
      await expect(promise).rejects.toHaveProperty('code', 'NETWORK_ERROR');
    });

    it('should handle user not found errors', async () => {
      const errorResponse = createMockResponse(
        { error: 'User not found' },
        404,
        'Not Found'
      );
      mockFetch.mockResolvedValue(errorResponse);

      const promise = client.users.getUserInfo();

      await expect(promise).rejects.toThrow(EchoError);
      await expect(promise).rejects.toHaveProperty('code', 'HTTP_404');
    });
  });

  describe('getAppUrl', () => {
    it('should generate correct app URL', async () => {
      const appId = 'test-app-123';
      const expectedUrl = `${TEST_SERVER_URL}/apps/${appId}`;

      const url = client.apps.getAppUrl(appId);

      expect(url).toBe(expectedUrl);
    });

    it('should handle special characters in app ID', async () => {
      const appId = 'test-app-with-special-chars_123';
      const expectedUrl = `${TEST_SERVER_URL}/apps/${appId}`;

      const url = client.apps.getAppUrl(appId);

      expect(url).toBe(expectedUrl);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const networkError = new TypeError('Failed to fetch');
      mockFetch.mockRejectedValue(networkError);

      const promise = client.balance.getBalance();

      await expect(promise).rejects.toThrow(EchoError);
      await expect(promise).rejects.toHaveProperty('code', 'NETWORK_ERROR');
    });

    it('should handle 401 unauthorized errors', async () => {
      const errorResponse = createMockResponse(
        { error: 'Authentication required. Please sign in again.' },
        401,
        'Unauthorized'
      );
      mockFetch.mockResolvedValue(errorResponse);

      const promise = client.balance.getBalance();

      await expect(promise).rejects.toThrow(EchoError);
      await expect(promise).rejects.toHaveProperty('code', 'HTTP_401');
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('The operation was aborted.');
      timeoutError.name = 'AbortError';
      mockFetch.mockRejectedValue(timeoutError);

      const promise = client.balance.getBalance();

      await expect(promise).rejects.toThrow(EchoError);
      await expect(promise).rejects.toHaveProperty('code', 'UNKNOWN_ERROR');
    });

    it('should handle API error responses', async () => {
      const errorResponse = createMockResponse(
        { error: 'Invalid request' },
        400,
        'Bad Request'
      );
      mockFetch.mockResolvedValue(errorResponse);

      const promise = client.balance.getBalance();

      await expect(promise).rejects.toThrow(EchoError);
      await expect(promise).rejects.toHaveProperty('code', 'HTTP_400');
    });
  });
});
