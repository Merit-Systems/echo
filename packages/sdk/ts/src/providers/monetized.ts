import type { LanguageModel } from 'ai';
import type { LanguageModelV2 } from '@ai-sdk/provider';
import { ROUTER_BASE_URL } from '../config';
import { createEchoAnthropic } from './anthropic';
import { createEchoGoogle } from './google';
import { createEchoOpenAI } from './openai';
import { createEchoOpenRouter } from './openrouter';
import type { EchoConfig } from '../types';

export interface MonetizedModelOptions {
  /** Echo application identifier used to scope billing */
  appId: string;
  /** Base Echo router URL; defaults to hosted router */
  baseRouterUrl?: string;
  /** Resolver that returns a short-lived Echo access token */
  getAccessToken: () => Promise<string | null>;
  /** Optional callback invoked when the router returns HTTP 402 */
  onInsufficientFunds?: () => void;
}

type SupportedProvider = 'openai' | 'anthropic' | 'google' | 'openrouter';

interface MonetizedContext extends MonetizedModelOptions {
  provider: SupportedProvider;
}

const OPENAI_PROVIDER_KIND_PATTERN = /openai\.(?<kind>\w+)/;
const OPENROUTER_PROVIDER_KIND_PATTERN = /openrouter\.(?<kind>\w+)/;

type OpenAIInvocationKind = 'chat' | 'completion' | 'responses';

function resolveOpenAIInvocationKind(providerId: string): OpenAIInvocationKind {
  const match = providerId.match(OPENAI_PROVIDER_KIND_PATTERN);
  const kind = match?.groups?.kind;

  switch (kind) {
    case 'chat':
      return 'chat';
    case 'completion':
      return 'completion';
    default:
      return 'responses';
  }
}

async function ensureAccessToken(
  resolve: () => Promise<string | null>
): Promise<string> {
  const token = await resolve();
  if (!token) {
    throw new Error(
      'Echo monetized models require an access token. Ensure the user is authenticated or supply a token provider.'
    );
  }
  return token;
}

function createOpenAIModel(
  model: LanguageModelV2,
  options: MonetizedContext
): LanguageModelV2 {
  const { appId, baseRouterUrl, getAccessToken, onInsufficientFunds } = options;

  const providerConfig: EchoConfig = {
    appId,
    baseRouterUrl: baseRouterUrl ?? ROUTER_BASE_URL,
  };

  const provider = createEchoOpenAI(
    providerConfig,
    async () => await ensureAccessToken(getAccessToken),
    onInsufficientFunds
  );

  const invocationKind = resolveOpenAIInvocationKind(model.provider);

  switch (invocationKind) {
    case 'chat':
      return provider.chat(model.modelId as never);
    case 'completion':
      return provider.completion(model.modelId as never);
    case 'responses':
    default:
      return provider.responses(model.modelId as never);
  }
}

function createAnthropicModel(
  model: LanguageModelV2,
  options: MonetizedContext
): LanguageModelV2 {
  const { appId, baseRouterUrl, getAccessToken, onInsufficientFunds } = options;

  const provider = createEchoAnthropic(
    {
      appId,
      baseRouterUrl: baseRouterUrl ?? ROUTER_BASE_URL,
    },
    async () => await ensureAccessToken(getAccessToken),
    onInsufficientFunds
  );

  return provider.messages(model.modelId as never);
}

function createGoogleModel(
  model: LanguageModelV2,
  options: MonetizedContext
): LanguageModelV2 {
  const { appId, baseRouterUrl, getAccessToken, onInsufficientFunds } = options;

  const provider = createEchoGoogle(
    {
      appId,
      baseRouterUrl: baseRouterUrl ?? ROUTER_BASE_URL,
    },
    async () => await ensureAccessToken(getAccessToken),
    onInsufficientFunds
  );

  return provider.chat(model.modelId as never);
}

type OpenRouterInvocationKind = 'chat' | 'completion';

function resolveOpenRouterInvocationKind(
  providerId: string
): OpenRouterInvocationKind {
  const match = providerId.match(OPENROUTER_PROVIDER_KIND_PATTERN);
  const kind = match?.groups?.kind;

  return kind === 'completion' ? 'completion' : 'chat';
}

function createOpenRouterModel(
  model: LanguageModelV2,
  options: MonetizedContext
): LanguageModelV2 {
  const { appId, baseRouterUrl, getAccessToken, onInsufficientFunds } = options;

  const provider = createEchoOpenRouter(
    {
      appId,
      baseRouterUrl: baseRouterUrl ?? ROUTER_BASE_URL,
    },
    async () => await ensureAccessToken(getAccessToken),
    onInsufficientFunds
  );

  const invocationKind = resolveOpenRouterInvocationKind(model.provider);

  switch (invocationKind) {
    case 'completion':
      return provider.completion(model.modelId as never);
    case 'chat':
    default:
      return provider.chat(model.modelId as never);
  }
}

function resolveProviderPrefix(providerId: string): SupportedProvider | null {
  const prefix = providerId.split('.')[0];

  switch (prefix) {
    case 'openai':
      return 'openai';
    case 'anthropic':
      return 'anthropic';
    case 'google':
      return 'google';
    case 'openrouter':
      return 'openrouter';
    default:
      return null;
  }
}

/**
 * Wraps a Vercel AI SDK language model so requests are routed through the Echo router.
 */
export function monetized(
  model: LanguageModel,
  options: MonetizedModelOptions
): LanguageModelV2 {
  if (typeof model === 'string') {
    throw new Error(
      'monetized() expects a provider instance (e.g. openai("gpt-4o")), not a plain model identifier.'
    );
  }

  const providerPrefix = resolveProviderPrefix(model.provider);

  if (!providerPrefix) {
    throw new Error(
      `Provider "${model.provider}" is not yet supported by monetized().`
    );
  }

  const context: MonetizedContext = { ...options, provider: providerPrefix };

  switch (context.provider) {
    case 'openai':
      return createOpenAIModel(model, context);
    case 'anthropic':
      return createAnthropicModel(model, context);
    case 'google':
      return createGoogleModel(model, context);
    case 'openrouter':
      return createOpenRouterModel(model, context);
    default: {
      const exhaustiveCheck: never = context.provider;
      throw new Error(
        `Provider "${exhaustiveCheck}" is not yet supported by monetized().`
      );
    }
  }
}
