/**
 * @file This file defines the types and enums related to AI providers and their models,
 * including pricing structures, to be consumed by the SDK.
 */

/**
 * Enum for available AI providers.
 * VercelAIGateway is added to support new integrations.
 */
export enum AIProvider {
  OpenAI = 'openai',
  Anthropic = 'anthropic',
  Gemini = 'gemini',
  Openrouter = 'openrouter',
  VercelAIGateway = 'vercel_ai_gateway', // New provider
}

/**
 * Represents the specific models available through the Vercel AI Gateway.
 * This includes various chat models and placeholders for speech/transcription
 * models, as Vercel AI Gateway can proxy different underlying services.
 */
export enum VercelAIGatewayModel {
  // Common Chat Models proxied via Vercel AI Gateway
  OpenAI_GPT3_5_Turbo = 'openai/gpt-3.5-turbo',
  OpenAI_GPT4 = 'openai/gpt-4',
  OpenAI_GPT4_Turbo = 'openai/gpt-4-turbo',
  Anthropic_ClaudeInstant = 'anthropic/claude-instant-1.2',
  Anthropic_Claude2_1 = 'anthropic/claude-2.1',
  Google_GeminiPro = 'google/gemini-pro',

  // Speech and Transcription Models (placeholders for future support)
  OpenAI_Whisper = 'openai/whisper-1', // For transcription
  ElevenLabs_Speech = 'elevenlabs/speech', // Example for TTS
  Google_SpeechToText = 'google/speech-to-text', // Another example for transcription
}

/**
 * Defines the pricing structure for a specific AI model from any provider.
 * This structure supports both token-based and time-based (audio) pricing.
 */
export interface ModelPricing {
  provider: AIProvider;
  model: string; // The specific model identifier (e.g., 'gpt-3.5-turbo', 'openai/whisper-1')
  pricing: {
    /** Cost per million input tokens in USD. */
    inputTokenCostPerMillion?: number;
    /** Cost per million output tokens in USD. */
    outputTokenCostPerMillion?: number;
    /** Cost per minute of audio input (e.g., for transcription) in USD. */
    audioInputCostPerMinute?: number;
    /** Cost per minute of audio output (e.g., for text-to-speech) in USD. */
    audioOutputCostPerMinute?: number;
    // Add other potential pricing metrics here as needed (e.g., image generation costs)
  };
  /** Timestamp when the pricing data was last updated. */
  lastUpdated: string;
}

/**
 * A registry containing pricing information for various AI models across all providers.
 * In a real application, this data would typically be loaded from a configuration service
 * or a database, rather than being hardcoded.
 */
export type PricingRegistry = ModelPricing[];

/**
 * An example default pricing registry, demonstrating how Vercel AI Gateway models
 * and their associated pricing would be captured.
 */
export const defaultPricingRegistry: PricingRegistry = [
  // --- Existing Provider Pricing Examples (for context) ---
  {
    provider: AIProvider.OpenAI,
    model: 'gpt-3.5-turbo',
    pricing: { inputTokenCostPerMillion: 0.50, outputTokenCostPerMillion: 1.50 },
    lastUpdated: '2023-10-26T10:00:00Z',
  },
  {
    provider: AIProvider.Anthropic,
    model: 'claude-2.1',
    pricing: { inputTokenCostPerMillion: 8.00, outputTokenCostPerMillion: 24.00 },
    lastUpdated: '2023-10-26T10:00:00Z',
  },
  // --- Vercel AI Gateway Pricing ---
  {
    provider: AIProvider.VercelAIGateway,
    model: VercelAIGatewayModel.OpenAI_GPT3_5_Turbo,
    // Vercel AI Gateway often proxies, so pricing might match underlying provider or have a small markup
    pricing: {
      inputTokenCostPerMillion: 0.55, // Example: slightly higher than direct OpenAI
      outputTokenCostPerMillion: 1.65,
    },
    lastUpdated: '2023-10-27T12:00:00Z',
  },
  {
    provider: AIProvider.VercelAIGateway,
    model: VercelAIGatewayModel.OpenAI_GPT4_Turbo,
    pricing: {
      inputTokenCostPerMillion: 10.50,
      outputTokenCostPerMillion: 31.50,
    },
    lastUpdated: '2023-10-27T12:00:00Z',
  },
  {
    provider: AIProvider.VercelAIGateway,
    model: VercelAIGatewayModel.OpenAI_Whisper,
    pricing: {
      audioInputCostPerMinute: 6.50, // Example: $0.0065 per minute for transcription
    },
    lastUpdated: '2023-10-27T12:00:00Z',
  },
  // Add more Vercel AI Gateway models and their respective pricing here as they are integrated.
];
