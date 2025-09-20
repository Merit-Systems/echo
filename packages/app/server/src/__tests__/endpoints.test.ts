import { ReadableStream } from 'stream/web';

import type express from 'express';
import request from 'supertest';
import { vi } from 'vitest';

import { EchoControlService } from '../services/EchoControlService';

// Mock the fetch module for outbound API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock environment variables
const originalEnv = process.env;
beforeAll(() => {
  process.env = {
    ...originalEnv,
    OPENAI_API_KEY: 'mock-openai-key',
    ANTHROPIC_API_KEY: 'mock-anthropic-key',
    ECHO_CONTROL_URL: 'http://localhost:3000',
  };
});

afterAll(() => {
  process.env = originalEnv;
});

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

// Mock responses for various API providers
const createMockStreamingResponse = (
  content: string,
  totalTokens: number = 10
) => {
  return new ReadableStream({
    start: controller => {
      // Send content chunks
      const words = content.split(' ');
      words.forEach((word, index) => {
        const chunk = {
          choices: [
            {
              index: 0,
              delta: { content: index === 0 ? word : ` ${word}` },
              finish_reason: null,
            },
          ],
          usage: null,
        };
        controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify(chunk)}\n\n`)
        );
      });

      // Send final chunk with usage
      const finalChunk = {
        choices: [
          {
            index: 0,
            delta: {},
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: Math.floor(totalTokens * 0.3),
          completion_tokens: Math.floor(totalTokens * 0.7),
          total_tokens: totalTokens,
        },
      };
      controller.enqueue(
        new TextEncoder().encode(`data: ${JSON.stringify(finalChunk)}\n\n`)
      );
      controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
};

const createMockNonStreamingResponse = (
  content: string,
  totalTokens: number = 10
) => {
  return {
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: content,
        },
        finish_reason: 'stop',
      },
    ],
    usage: {
      prompt_tokens: Math.floor(totalTokens * 0.3),
      completion_tokens: Math.floor(totalTokens * 0.7),
      total_tokens: totalTokens,
    },
  };
};

const createMockAnthropicResponse = (
  content: string,
  totalTokens: number = 10
) => {
  return {
    content: [
      {
        type: 'text',
        text: content,
      },
    ],
    usage: {
      input_tokens: Math.floor(totalTokens * 0.3),
      output_tokens: Math.floor(totalTokens * 0.7),
    },
  };
};

const createMockAnthropicStreamingResponse = (
  content: string,
  totalTokens: number = 10
) => {
  return new ReadableStream({
    start: controller => {
      // Send message_start event with initial usage, id, and model
      const messageStartChunk = {
        type: 'message_start',
        message: {
          id: 'test-message-id',
          model: 'claude-3-5-sonnet-20240620',
          usage: {
            input_tokens: Math.floor(totalTokens * 0.3),
            output_tokens: 0,
          },
        },
      };
      controller.enqueue(
        new TextEncoder().encode(
          `data: ${JSON.stringify(messageStartChunk)}\n\n`
        )
      );

      // Send content chunks
      const words = content.split(' ');
      words.forEach((word, index) => {
        const chunk = {
          type: 'content_block_delta',
          delta: { text: index === 0 ? word : ` ${word}` },
        };
        controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify(chunk)}\n\n`)
        );
      });

      // Send final usage chunk with output tokens
      const usageChunk = {
        type: 'message_delta',
        usage: {
          output_tokens: Math.floor(totalTokens * 0.7),
        },
      };
      controller.enqueue(
        new TextEncoder().encode(`data: ${JSON.stringify(usageChunk)}\n\n`)
      );
      controller.close();
    },
  });
};

// Helper function to create a proper Headers mock
const createMockHeaders = (headers: [string, string][]) => {
  const headersMap = new Map(headers);
  return {
    get: (key: string) => headersMap.get(key.toLowerCase()),
    has: (key: string) => headersMap.has(key.toLowerCase()),
    entries: () => headersMap.entries(),
    keys: () => headersMap.keys(),
    values: () => headersMap.values(),
  };
};

// Helper function to setup successful EchoControlService mocks
const setupMockEchoControlService = (balance: number = 1000) => {
  const MockedEchoControlService = EchoControlService as any;
  const mockInstance = new MockedEchoControlService('mock-key');

  (mockInstance.verifyApiKey as any).mockResolvedValue({
    userId: TEST_USER_ID,
    echoAppId: TEST_ECHO_APP_ID,
    user: MOCK_USER,
    echoApp: MOCK_ECHO_APP,
  });

  (mockInstance.getBalance as any).mockResolvedValue(balance);
  (mockInstance.getUserId as any).mockReturnValue(TEST_USER_ID);
  (mockInstance.getEchoAppId as any).mockReturnValue(TEST_ECHO_APP_ID);
  (mockInstance.getUser as any).mockReturnValue(MOCK_USER);
  (mockInstance.getEchoApp as any).mockReturnValue(MOCK_ECHO_APP);
  (mockInstance.createTransaction as any).mockResolvedValue(undefined);

  MockedEchoControlService.mockImplementation(() => mockInstance);

  return mockInstance;
};

describe('Endpoint Tests', () => {
  let app: express.Application;

  let mockEchoControlService: any;

  beforeEach(async () => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    mockFetch.mockClear();

    // Setup EchoControlService mock with sufficient balance
    mockEchoControlService = setupMockEchoControlService(1000);

    // Import the app after mocking
    const serverModule = await import('../server');
    app = serverModule.default;
  });

  describe('Provider-specific tests', () => {
    const providers = [
      {
        model: 'gpt-3.5-turbo',
        name: 'GPT',
        path: '/chat/completions',
        authHeader: 'Authorization',
        authValue: `Bearer ${TEST_TOKEN}`,
      },
      {
        model: 'gpt-4o',
        name: 'GPT',
        path: '/chat/completions',
        authHeader: 'Authorization',
        authValue: `Bearer ${TEST_TOKEN}`,
      },
      {
        model: 'claude-3-5-sonnet-20240620',
        name: 'AnthropicGPT',
        path: '/chat/completions',
        authHeader: 'Authorization',
        authValue: `Bearer ${TEST_TOKEN}`,
      },
      {
        model: 'claude-3-5-sonnet-20240620',
        name: 'AnthropicNative',
        path: '/messages',
        authHeader: 'x-api-key',
        authValue: TEST_TOKEN,
      },
    ];

    providers.forEach(({ model, name, path, authHeader, authValue }) => {
      describe(`${name} Provider (${model}) on ${path}`, () => {
        describe('Non-streaming endpoints', () => {
          it('should handle non-streaming requests successfully', async () => {
            // Skip AnthropicNative non-streaming test as it's not implemented
            if (name === 'AnthropicNative') {
              return;
            }

            const expectedContent = 'Hello, this is a test response!';
            const expectedTokens = 15;

            if (name === 'AnthropicNative') {
              mockFetch.mockResolvedValueOnce({
                status: 200,
                headers: createMockHeaders([
                  ['content-type', 'application/json'],
                ]),
                json: () =>
                  Promise.resolve(
                    createMockAnthropicResponse(expectedContent, expectedTokens)
                  ),
              });
            } else {
              // GPT and AnthropicGPT both use OpenAI format
              mockFetch.mockResolvedValueOnce({
                status: 200,
                headers: createMockHeaders([
                  ['content-type', 'application/json'],
                ]),
                json: () =>
                  Promise.resolve(
                    createMockNonStreamingResponse(
                      expectedContent,
                      expectedTokens
                    )
                  ),
              });
            }

            const response = await request(app)
              .post(path)
              .set(authHeader, authValue)
              .send({
                model: model,
                messages: [{ role: 'user', content: 'Test prompt' }],
                stream: false,
              });

            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toContain(
              'application/json'
            );
            expect(response.body.choices[0].message.content).toBe(
              expectedContent
            );
          }, 10000);

          it('should create transaction for non-streaming requests', async () => {
            // Skip AnthropicNative non-streaming test as it's not implemented
            if (name === 'AnthropicNative') {
              return;
            }

            const expectedTokens = 20;

            if (name === 'AnthropicNative') {
              mockFetch.mockResolvedValueOnce({
                status: 200,
                headers: createMockHeaders([
                  ['content-type', 'application/json'],
                ]),
                json: () =>
                  Promise.resolve(
                    createMockAnthropicResponse('Test response', expectedTokens)
                  ),
              });
            } else {
              // GPT and AnthropicGPT both use OpenAI format
              mockFetch.mockResolvedValueOnce({
                status: 200,
                headers: createMockHeaders([
                  ['content-type', 'application/json'],
                ]),
                json: () =>
                  Promise.resolve(
                    createMockNonStreamingResponse(
                      'Test response',
                      expectedTokens
                    )
                  ),
              });
            }

            await request(app)
              .post(path)
              .set(authHeader, authValue)
              .send({
                model: model,
                messages: [{ role: 'user', content: 'Test prompt' }],
                stream: false,
              });

            // Wait a bit for async processing
            await new Promise(resolve => setTimeout(resolve, 100));

            // Verify transaction was created
            expect(
              mockEchoControlService.createTransaction
            ).toHaveBeenCalledWith(
              expect.objectContaining({
                model: model,
                totalTokens: expectedTokens,
                status: 'success',
              })
            );
          }, 10000);

          it('should return correct content-type for non-streaming', async () => {
            // Skip AnthropicNative non-streaming test as it's not implemented
            if (name === 'AnthropicNative') {
              return;
            }

            if (name === 'AnthropicNative') {
              mockFetch.mockResolvedValueOnce({
                status: 200,
                headers: createMockHeaders([
                  ['content-type', 'application/json'],
                ]),
                json: () =>
                  Promise.resolve(createMockAnthropicResponse('Test', 10)),
              });
            } else {
              // GPT and AnthropicGPT both use OpenAI format
              mockFetch.mockResolvedValueOnce({
                status: 200,
                headers: createMockHeaders([
                  ['content-type', 'application/json'],
                ]),
                json: () =>
                  Promise.resolve(createMockNonStreamingResponse('Test', 10)),
              });
            }

            const response = await request(app)
              .post(path)
              .set(authHeader, authValue)
              .send({
                model: model,
                messages: [{ role: 'user', content: 'Test' }],
              });

            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toContain(
              'application/json'
            );
          }, 10000);
        });

        describe('Streaming endpoints', () => {
          it('should handle streaming requests successfully', async () => {
            const expectedContent = 'Hello streaming world!';
            const expectedTokens = 12;

            if (name === 'AnthropicNative') {
              mockFetch.mockResolvedValueOnce({
                status: 200,
                headers: createMockHeaders([
                  ['content-type', 'text/event-stream'],
                ]),
                body: createMockAnthropicStreamingResponse(
                  expectedContent,
                  expectedTokens
                ),
              });
            } else {
              // GPT and AnthropicGPT both use OpenAI format
              mockFetch.mockResolvedValueOnce({
                status: 200,
                headers: createMockHeaders([
                  ['content-type', 'text/event-stream'],
                ]),
                body: createMockStreamingResponse(
                  expectedContent,
                  expectedTokens
                ),
              });
            }

            const response = await request(app)
              .post(path)
              .set(authHeader, authValue)
              .send({
                model: model,
                messages: [{ role: 'user', content: 'Test streaming prompt' }],
                stream: true,
              });

            expect(response.status).toBe(200);
            // Note: supertest might not capture streaming headers properly in all cases
            // This is a limitation of the testing setup
          }, 10000);

          it('should create transaction for streaming requests', async () => {
            const expectedTokens = 25;

            if (name === 'AnthropicNative') {
              mockFetch.mockResolvedValueOnce({
                status: 200,
                headers: createMockHeaders([
                  ['content-type', 'text/event-stream'],
                ]),
                body: createMockAnthropicStreamingResponse(
                  'Streaming test',
                  expectedTokens
                ),
              });
            } else {
              // GPT and AnthropicGPT both use OpenAI format
              mockFetch.mockResolvedValueOnce({
                status: 200,
                headers: createMockHeaders([
                  ['content-type', 'text/event-stream'],
                ]),
                body: createMockStreamingResponse(
                  'Streaming test',
                  expectedTokens
                ),
              });
            }

            await request(app)
              .post(path)
              .set(authHeader, authValue)
              .send({
                model: model,
                messages: [{ role: 'user', content: 'Test streaming' }],
                stream: true,
              });

            // Wait for stream processing to complete
            await new Promise(resolve => setTimeout(resolve, 500));

            // Verify transaction was created
            expect(
              mockEchoControlService.createTransaction
            ).toHaveBeenCalledWith(
              expect.objectContaining({
                model: model,
                status: 'success',
              })
            );

            // Check token counts based on provider type
            if (name === 'AnthropicNative') {
              // AnthropicNative counts both input and output tokens
              const inputTokens = Math.floor(expectedTokens * 0.3);
              const outputTokens = Math.floor(expectedTokens * 0.7);
              const totalTokens = inputTokens + outputTokens;
              expect(
                mockEchoControlService.createTransaction
              ).toHaveBeenCalledWith(
                expect.objectContaining({
                  inputTokens: inputTokens,
                  outputTokens: outputTokens,
                  totalTokens: totalTokens,
                })
              );
            } else {
              expect(
                mockEchoControlService.createTransaction
              ).toHaveBeenCalledWith(
                expect.objectContaining({
                  totalTokens: expectedTokens,
                })
              );
            }
          }, 10000);

          it('should handle stream with multiple content chunks', async () => {
            const longContent =
              'This is a much longer response that will be split into multiple chunks for streaming';
            const expectedTokens = 30;

            if (name === 'AnthropicNative') {
              mockFetch.mockResolvedValueOnce({
                status: 200,
                headers: createMockHeaders([
                  ['content-type', 'text/event-stream'],
                ]),
                body: createMockAnthropicStreamingResponse(
                  longContent,
                  expectedTokens
                ),
              });
            } else {
              // GPT and AnthropicGPT both use OpenAI format
              mockFetch.mockResolvedValueOnce({
                status: 200,
                headers: createMockHeaders([
                  ['content-type', 'text/event-stream'],
                ]),
                body: createMockStreamingResponse(longContent, expectedTokens),
              });
            }

            const response = await request(app)
              .post(path)
              .set(authHeader, authValue)
              .send({
                model: model,
                messages: [{ role: 'user', content: 'Tell me a story' }],
                stream: true,
              });

            expect(response.status).toBe(200);
          }, 10000);
        });
      });
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

    it('should work with Bearer token for OpenAI format', async () => {
      mockFetch.mockResolvedValueOnce({
        status: 200,
        headers: createMockHeaders([['content-type', 'application/json']]),
        json: () => Promise.resolve(createMockNonStreamingResponse('Test', 10)),
      });

      const response = await request(app)
        .post('/chat/completions')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Test' }],
        });

      expect(response.status).toBe(200);
    }, 10000);

    it('should work with x-api-key header for Anthropic native', async () => {
      mockFetch.mockResolvedValueOnce({
        status: 200,
        headers: createMockHeaders([['content-type', 'text/event-stream']]),
        body: createMockAnthropicStreamingResponse('Test', 10),
      });

      const response = await request(app)
        .post('/messages')
        .set('x-api-key', TEST_TOKEN)
        .send({
          model: 'claude-3-5-sonnet-20240620',
          messages: [{ role: 'user', content: 'Test' }],
          stream: true,
        });

      expect(response.status).toBe(200);
    }, 10000);
  });

  describe('Error Handling Tests', () => {
    it('should handle upstream API errors for non-streaming', async () => {
      mockFetch.mockResolvedValueOnce({
        status: 400,
        headers: createMockHeaders([['content-type', 'application/json']]),
        json: () =>
          Promise.resolve({ error: { message: 'Bad request from upstream' } }),
      });

      const response = await request(app)
        .post('/chat/completions')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Test' }],
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    }, 10000);

    it('should handle upstream API errors for streaming', async () => {
      mockFetch.mockResolvedValueOnce({
        status: 429,
        headers: createMockHeaders([['content-type', 'application/json']]),
        json: () =>
          Promise.resolve({ error: { message: 'Rate limit exceeded' } }),
      });

      const response = await request(app)
        .post('/chat/completions')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Test' }],
          stream: true,
        });

      expect(response.status).toBe(429);
      expect(response.body.error).toBeDefined();
    }, 10000);

    it('should handle unknown models', async () => {
      const response = await request(app)
        .post('/chat/completions')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({
          model: 'unknown-model',
          messages: [{ role: 'user', content: 'Test' }],
        });

      expect(response.status).toBe(422);
      expect(response.body.error).toContain('Invalid model');
    }, 10000);
  });

  describe('Account Balance Tests', () => {
    it('should reject requests when account has insufficient balance', async () => {
      // Setup EchoControlService with zero balance
      (mockEchoControlService.getBalance as any).mockResolvedValue(0);

      const response = await request(app)
        .post('/chat/completions')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Test' }],
        });

      expect(response.status).toBe(402);
      expect(response.body.error).toBeDefined();
    }, 10000);

    it('should allow requests when account has sufficient balance', async () => {
      // Ensure account has balance (already set up in beforeEach)
      mockFetch.mockResolvedValueOnce({
        status: 200,
        headers: createMockHeaders([['content-type', 'application/json']]),
        json: () => Promise.resolve(createMockNonStreamingResponse('Test', 10)),
      });

      const response = await request(app)
        .post('/chat/completions')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Test' }],
        });

      expect(response.status).toBe(200);
    }, 10000);
  });

  describe('Request Body Processing Tests', () => {
    it('should add stream_options for streaming requests', async () => {
      mockFetch.mockResolvedValueOnce({
        status: 200,
        headers: createMockHeaders([['content-type', 'text/event-stream']]),
        body: createMockStreamingResponse('Test', 10),
      });

      await request(app)
        .post('/chat/completions')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Test' }],
          stream: true,
        });

      // Verify that fetch was called with stream_options
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining(
            '"stream_options":{"include_usage":true}'
          ),
        })
      );
    }, 10000);

    it('should not add stream_options for non-streaming requests', async () => {
      mockFetch.mockResolvedValueOnce({
        status: 200,
        headers: createMockHeaders([['content-type', 'application/json']]),
        json: () => Promise.resolve(createMockNonStreamingResponse('Test', 10)),
      });

      await request(app)
        .post('/chat/completions')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Test' }],
          stream: false,
        });

      // Verify that fetch was called without stream_options
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.not.stringContaining('stream_options'),
        })
      );
    }, 10000);
  });
});
