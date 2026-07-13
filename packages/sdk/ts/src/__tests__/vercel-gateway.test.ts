import { describe, it, expect, vi } from 'vitest';
import { createEchoVercelGateway } from '../src/providers/vercel';
import { echoFetch } from '../src/providers/index';

// Mock @ai-sdk/gateway
vi.mock('@ai-sdk/gateway', () => ({
  createGatewayProvider: vi.fn((options) => ({
    _type: 'gateway',
    _options: options,
    languageModel: vi.fn(),
    getAvailableModels: vi.fn(),
    getCredits: vi.fn(),
    textEmbeddingModel: vi.fn(),
  })),
}));

describe('createEchoVercelGateway', () => {
  const mockGetTokenFn = vi.fn();
  const mockOnInsufficientFunds = vi.fn();

  it('should create a gateway provider with echo fetch wrapper', () => {
    const provider = createEchoVercelGateway(
      { appId: '60601628-cdb7-481e-8f7e-921981220348' },
      mockGetTokenFn,
      mockOnInsufficientFunds
    );

    expect(provider._type).toBe('gateway');
    expect(provider._options.apiKey).toBe('placeholder_replaced_by_echoFetch');
    expect(provider._options.baseURL).toBe('https://echo.router.merit.systems');
    expect(provider._options.fetch).toBeDefined();
  });

  it('should use custom baseRouterUrl when provided', () => {
    const provider = createEchoVercelGateway(
      {
        appId: '60601628-cdb7-481e-8f7e-921981220348',
        baseRouterUrl: 'https://custom-gateway.example.com',
      },
      mockGetTokenFn,
      mockOnInsufficientFunds
    );

    expect(provider._options.baseURL).toBe('https://custom-gateway.example.com');
  });

  it('should throw on invalid appId', () => {
    expect(() =>
      createEchoVercelGateway(
        { appId: 'invalid' },
        mockGetTokenFn,
        mockOnInsufficientFunds
      )
    ).toThrow('Invalid Echo App ID');
  });

  it('should throw on empty appId', () => {
    expect(() =>
      createEchoVercelGateway(
        { appId: '' },
        mockGetTokenFn,
        mockOnInsufficientFunds
      )
    ).toThrow('Invalid Echo App ID');
  });
});
