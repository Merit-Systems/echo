import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LanguageModelV2 } from '@ai-sdk/provider';
import { monetized, type MonetizedModelOptions } from '../providers/monetized';

const {
  openAIProviderMock,
  createEchoOpenAIMock,
  anthropicProviderMock,
  createEchoAnthropicMock,
  googleProviderMock,
  createEchoGoogleMock,
  openRouterProviderMock,
  createEchoOpenRouterMock,
} = vi.hoisted(() => {
  const openAIProviderMock = {
    responses: vi.fn(),
    chat: vi.fn(),
    completion: vi.fn(),
  };
  const anthropicProviderMock = {
    messages: vi.fn(),
  };
  const googleProviderMock = {
    chat: vi.fn(),
  };
  const openRouterProviderMock = {
    chat: vi.fn(),
    completion: vi.fn(),
  };

  return {
    openAIProviderMock,
    createEchoOpenAIMock: vi.fn(() => openAIProviderMock),
    anthropicProviderMock,
    createEchoAnthropicMock: vi.fn(() => anthropicProviderMock),
    googleProviderMock,
    createEchoGoogleMock: vi.fn(() => googleProviderMock),
    openRouterProviderMock,
    createEchoOpenRouterMock: vi.fn(() => openRouterProviderMock),
  };
});

vi.mock('../providers/openai', () => ({
  createEchoOpenAI: createEchoOpenAIMock,
}));
vi.mock('../providers/anthropic', () => ({
  createEchoAnthropic: createEchoAnthropicMock,
}));
vi.mock('../providers/google', () => ({
  createEchoGoogle: createEchoGoogleMock,
}));
vi.mock('../providers/openrouter', () => ({
  createEchoOpenRouter: createEchoOpenRouterMock,
}));

const createStubModel = (
  provider: string,
  modelId = 'gpt-5'
): LanguageModelV2 =>
  ({
    specificationVersion: 'v2',
    provider,
    modelId,
    supportedUrls: {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    doGenerate: vi.fn(),
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    doStream: vi.fn(),
  }) as unknown as LanguageModelV2;

describe('monetized', () => {
  const defaultOptions: MonetizedModelOptions = {
    appId: 'app-123',
    getAccessToken: async () => 'token',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    openAIProviderMock.responses.mockReset();
    openAIProviderMock.chat.mockReset();
    openAIProviderMock.completion.mockReset();
    anthropicProviderMock.messages.mockReset();
    googleProviderMock.chat.mockReset();
    openRouterProviderMock.chat.mockReset();
    openRouterProviderMock.completion.mockReset();
  });

  it('rewraps an OpenAI responses model', () => {
    const original = createStubModel('openai.responses', 'gpt-5');
    const wrapped = createStubModel('openai.responses', 'gpt-5');
    openAIProviderMock.responses.mockReturnValueOnce(wrapped);

    const result = monetized(original, defaultOptions);

    expect(createEchoOpenAIMock).toHaveBeenCalledWith(
      expect.objectContaining({ appId: 'app-123' }),
      expect.any(Function),
      undefined
    );
    expect(openAIProviderMock.responses).toHaveBeenCalledWith('gpt-5');
    expect(result).toBe(wrapped);
  });

  it('rewraps an OpenAI chat model', () => {
    const original = createStubModel('openai.chat', 'gpt-4o');
    const wrapped = createStubModel('openai.chat', 'gpt-4o');
    openAIProviderMock.chat.mockReturnValueOnce(wrapped);

    const result = monetized(original, defaultOptions);

    expect(openAIProviderMock.chat).toHaveBeenCalledWith('gpt-4o');
    expect(result).toBe(wrapped);
  });

  it('rewraps an OpenAI completion model', () => {
    const original = createStubModel('openai.completion', 'gpt-3.5');
    const wrapped = createStubModel('openai.completion', 'gpt-3.5');
    openAIProviderMock.completion.mockReturnValueOnce(wrapped);

    const result = monetized(original, defaultOptions);

    expect(openAIProviderMock.completion).toHaveBeenCalledWith('gpt-3.5');
    expect(result).toBe(wrapped);
  });

  it('rewraps an Anthropic model', () => {
    const original = createStubModel('anthropic.messages', 'claude-3-5-haiku');
    const wrapped = createStubModel('anthropic.messages', 'claude-3-5-haiku');
    anthropicProviderMock.messages.mockReturnValueOnce(wrapped);

    const result = monetized(original, defaultOptions);

    expect(createEchoAnthropicMock).toHaveBeenCalled();
    expect(anthropicProviderMock.messages).toHaveBeenCalledWith(
      'claude-3-5-haiku'
    );
    expect(result).toBe(wrapped);
  });

  it('rewraps a Google Generative AI model', () => {
    const original = createStubModel('google.generative-ai', 'gemini-2.0');
    const wrapped = createStubModel('google.generative-ai', 'gemini-2.0');
    googleProviderMock.chat.mockReturnValueOnce(wrapped);

    const result = monetized(original, defaultOptions);

    expect(createEchoGoogleMock).toHaveBeenCalled();
    expect(googleProviderMock.chat).toHaveBeenCalledWith('gemini-2.0');
    expect(result).toBe(wrapped);
  });

  it('rewraps an OpenRouter completion model', () => {
    const original = createStubModel('openrouter.completion', 'openai/gpt-3.5');
    const wrapped = createStubModel('openrouter.completion', 'openai/gpt-3.5');
    openRouterProviderMock.completion.mockReturnValueOnce(wrapped);

    const result = monetized(original, defaultOptions);

    expect(createEchoOpenRouterMock).toHaveBeenCalled();
    expect(openRouterProviderMock.completion).toHaveBeenCalledWith(
      'openai/gpt-3.5'
    );
    expect(result).toBe(wrapped);
  });

  it('throws for unsupported provider prefixes', () => {
    const original = createStubModel('mistral.chat');

    expect(() => monetized(original, defaultOptions)).toThrow(
      'Provider "mistral.chat" is not yet supported by monetized().'
    );
  });

  it('throws when provided a model identifier string', () => {
    expect(() => monetized('gpt-5', defaultOptions)).toThrow(
      'monetized() expects a provider instance'
    );
  });
});
