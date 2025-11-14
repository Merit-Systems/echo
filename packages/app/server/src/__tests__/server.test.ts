import { ReadableStream } from 'stream/web';

import type express from 'express';
import request from 'supertest';
import { vi } from 'vitest';
import { ok } from 'neverthrow';

import { EchoControlService } from '../services/EchoControlService';

// Mock the fetch module for outbound API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Test constants
const TEST_TOKEN = 'this-is-a-test-api-key';
const TEST_USER_ID = 'user-ben-reilly';
const TEST_ECHO_APP_ID = 'echo-app-123';

// Mock user and echo app data
const MOCK_USER = {
  id: TEST_USER_ID,
  email: 'ben@test.com',
  name: 'Ben Reilly',
};

const MOCK_ECHO_APP = {
  id: TEST_ECHO_APP_ID,
  name: 'Test App',
  userId: TEST_USER_ID,
};

// Helper function to setup successful EchoControlService mocks
const setupMockEchoControlService = (balance: number = 100) => {
  const MockedEchoControlService = EchoControlService as any;
  const mockInstance = new MockedEchoControlService('mock-key');

  (mockInstance.verifyApiKey as any).mockResolvedValue({
    userId: TEST_USER_ID,
    echoAppId: TEST_ECHO_APP_ID,
    user: MOCK_USER,
    echoApp: MOCK_ECHO_APP,
  });

  (mockInstance.getBalance as any).mockResolvedValue(ok(balance));
  (mockInstance.getUserId as any).mockReturnValue(TEST_USER_ID);
  (mockInstance.getEchoAppId as any).mockReturnValue(TEST_ECHO_APP_ID);
  (mockInstance.getUser as any).mockReturnValue(MOCK_USER);
  (mockInstance.getEchoApp as any).mockReturnValue(MOCK_ECHO_APP);
  (mockInstance.createTransaction as any).mockResolvedValue(ok(undefined));
  (mockInstance.computeTransactionCosts as any).mockResolvedValue(ok({
    rawTransactionCost: 0.01,
    totalTransactionCost: 0.01,
    totalAppProfit: 0,
    referralProfit: 0,
    markUpProfit: 0,
    echoProfit: 0,
  }));
  (mockInstance.getOrNoneFreeTierSpendPool as any).mockResolvedValue(ok(null));

  MockedEchoControlService.mockImplementation(() => mockInstance);

  return mockInstance;
};

describe('Server Tests', () => {
  let app: express.Application;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockEchoControlService: any;

  beforeEach(async () => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    mockFetch.mockClear();

    // Setup EchoControlService mock with sufficient balance
    mockEchoControlService = setupMockEchoControlService(100);

    // Import the app after mocking
    const serverModule = await import('../server');
    app = serverModule.default;
  });

  describe('Payment Required Tests', () => {
    it('should handle payment required errors', async () => {
      // Setup EchoControlService with zero balance
      (mockEchoControlService.getBalance as any).mockResolvedValue(0);

      const response = await request(app)
        .post('/chat/completions')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Test prompt' }],
        });

      expect(response.status).toBe(402);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Streaming endpoints', () => {
    it('should handle streaming requests for all providers', async () => {
      const providers = [
        {
          model: 'gpt-3.5-turbo',
          path: '/chat/completions',
          authHeader: 'Authorization',
          authValue: `Bearer ${TEST_TOKEN}`,
        },
        {
          model: 'gpt-4o',
          path: '/chat/completions',
          authHeader: 'Authorization',
          authValue: `Bearer ${TEST_TOKEN}`,
        },
        {
          model: 'claude-3-5-sonnet-20240620',
          path: '/chat/completions',
          authHeader: 'Authorization',
          authValue: `Bearer ${TEST_TOKEN}`,
        },
        {
          model: 'claude-3-5-sonnet-20240620',
          path: '/messages',
          authHeader: 'x-api-key',
          authValue: TEST_TOKEN,
        },
      ];

      for (const provider of providers) {
        // Setup mock streaming response
        const mockStreamingResponse = new ReadableStream({
          start: controller => {
            if (provider.path === '/messages') {
              // For Anthropic Native, send message_start event with proper SSE format
              const messageStart = {
                type: 'message_start',
                message: {
                  id: 'msg_test_123',
                  type: 'message',
                  role: 'assistant',
                  model: provider.model,
                  content: [],
                  stop_reason: null,
                  stop_sequence: null,
                  usage: { input_tokens: 3, output_tokens: 1 },
                },
              };
              controller.enqueue(
                new TextEncoder().encode(
                  `event: message_start\ndata: ${JSON.stringify(messageStart)}\n\n`
                )
              );

              // Then send content chunk
              const chunk = {
                type: 'content_block_delta',
                delta: { text: 'Hello' },
              };
              controller.enqueue(
                new TextEncoder().encode(
                  `event: content_block_delta\ndata: ${JSON.stringify(chunk)}\n\n`
                )
              );
            } else {
              // For GPT providers
              const chunk = {
                choices: [
                  {
                    index: 0,
                    delta: { content: 'Hello' },
                    finish_reason: null,
                  },
                ],
                usage: null,
              };
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify(chunk)}\n\n`)
              );
            }

            // Send usage chunk
            if (provider.path === '/messages') {
              const usageChunk = {
                type: 'message_delta',
                delta: { stop_reason: 'end_turn', stop_sequence: null },
                usage: { output_tokens: 7 },
              };
              controller.enqueue(
                new TextEncoder().encode(
                  `event: message_delta\ndata: ${JSON.stringify(usageChunk)}\n\n`
                )
              );

              // Send message_stop event
              const stopChunk = { type: 'message_stop' };
              controller.enqueue(
                new TextEncoder().encode(
                  `event: message_stop\ndata: ${JSON.stringify(stopChunk)}\n\n`
                )
              );
            } else {
              const usageChunk = {
                choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
                usage: {
                  prompt_tokens: 3,
                  completion_tokens: 7,
                  total_tokens: 10,
                },
              };
              controller.enqueue(
                new TextEncoder().encode(
                  `data: ${JSON.stringify(usageChunk)}\n\n`
                )
              );
            }
            controller.close();
          },
        });

        mockFetch.mockResolvedValueOnce({
          status: 200,
          headers: new Map([['content-type', 'text/event-stream']]),
          body: mockStreamingResponse,
        });

        const response = await request(app)
          .post(provider.path)
          .set(provider.authHeader, provider.authValue)
          .send({
            model: provider.model,
            messages: [{ role: 'user', content: 'Test prompt' }],
            stream: true,
          });

        expect(response.status).toBe(200);
      }
    });

    it('should create transactions for streaming requests', async () => {
      // Setup mock streaming response with usage
      const mockStreamingResponse = new ReadableStream({
        start: controller => {
          const chunk = {
            choices: [
              { index: 0, delta: { content: 'Hello' }, finish_reason: null },
            ],
            usage: null,
          };
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify(chunk)}\n\n`)
          );

          const usageChunk = {
            choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
            usage: {
              prompt_tokens: 5,
              completion_tokens: 10,
              total_tokens: 15,
            },
          };
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify(usageChunk)}\n\n`)
          );
          controller.close();
        },
      });

      mockFetch.mockResolvedValueOnce({
        status: 200,
        headers: new Map([['content-type', 'text/event-stream']]),
        body: mockStreamingResponse,
      });

      await request(app)
        .post('/chat/completions')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Test prompt' }],
          stream: true,
        });

      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify transaction was created
      expect(mockEchoControlService.createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-3.5-turbo',
          totalTokens: 15,
          status: 'success',
        })
      );
    });
  });

  describe('Non-streaming endpoints', () => {
    it('should handle non-streaming requests for all providers', async () => {
      const providers = [
        {
          model: 'gpt-3.5-turbo',
          path: '/chat/completions',
          authHeader: 'Authorization',
          authValue: `Bearer ${TEST_TOKEN}`,
        },
        {
          model: 'gpt-4o',
          path: '/chat/completions',
          authHeader: 'Authorization',
          authValue: `Bearer ${TEST_TOKEN}`,
        },
        {
          model: 'claude-3-5-sonnet-20240620',
          path: '/chat/completions',
          authHeader: 'Authorization',
          authValue: `Bearer ${TEST_TOKEN}`,
        },
        // Note: AnthropicNative non-streaming is not implemented, so we skip it
      ];

      for (const provider of providers) {
        const mockResponse = {
          choices: [
            {
              index: 0,
              message: { role: 'assistant', content: 'Hello, world!' },
              finish_reason: 'stop',
            },
          ],
          usage: { prompt_tokens: 3, completion_tokens: 7, total_tokens: 10 },
        };

        mockFetch.mockResolvedValueOnce({
          status: 200,
          headers: new Map([['content-type', 'application/json']]),
          json: () => Promise.resolve(mockResponse),
        });

        const response = await request(app)
          .post(provider.path)
          .set(provider.authHeader, provider.authValue)
          .send({
            model: provider.model,
            messages: [{ role: 'user', content: 'Test prompt' }],
            stream: false,
          });

        expect(response.status).toBe(200);
        expect(response.body.choices[0].message.content).toBe('Hello, world!');
      }
    });

    it('should create transactions for non-streaming requests', async () => {
      const mockResponse = {
        choices: [
          {
            index: 0,
            message: { role: 'assistant', content: 'Hello, world!' },
            finish_reason: 'stop',
          },
        ],
        usage: { prompt_tokens: 8, completion_tokens: 12, total_tokens: 20 },
      };

      mockFetch.mockResolvedValueOnce({
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockResponse),
      });

      await request(app)
        .post('/chat/completions')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Test prompt' }],
          stream: false,
        });

      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify transaction was created
      expect(mockEchoControlService.createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-3.5-turbo',
          totalTokens: 20,
          status: 'success',
        })
      );
    });
  });

  describe('Authentication Tests', () => {
    it('should reject requests without authorization header', async () => {
      const response = await request(app)
        .post('/chat/completions')
        .send({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Test prompt' }],
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject requests with invalid authorization format', async () => {
      // Setup EchoControlService to fail validation
      (mockEchoControlService.verifyApiKey as any).mockResolvedValue(null);

      const response = await request(app)
        .post('/chat/completions')
        .set('Authorization', 'InvalidFormat')
        .send({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Test prompt' }],
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject requests with invalid token', async () => {
      // Setup EchoControlService to fail validation
      (mockEchoControlService.verifyApiKey as any).mockResolvedValue(null);

      const response = await request(app)
        .post('/chat/completions')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Test prompt' }],
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Account Management Tests', () => {
    it('should reject requests when account has insufficient balance', async () => {
      // Setup EchoControlService with zero balance
      (mockEchoControlService.getBalance as any).mockResolvedValue(0);

      const response = await request(app)
        .post('/chat/completions')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Test prompt' }],
        });

      expect(response.status).toBe(402);
      expect(response.body).toHaveProperty('error');
    });

    it('should allow requests when account has sufficient balance', async () => {
      // Balance is already set up in beforeEach, just need to mock API response
      const mockResponse = {
        choices: [
          {
            index: 0,
            message: { role: 'assistant', content: 'Hello!' },
            finish_reason: 'stop',
          },
        ],
        usage: { prompt_tokens: 3, completion_tokens: 5, total_tokens: 8 },
      };

      mockFetch.mockResolvedValueOnce({
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockResponse),
      });

      const response = await request(app)
        .post('/chat/completions')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Test prompt' }],
        });

      expect(response.status).toBe(200);
    });
  });
});
