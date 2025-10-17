import { SupportedModel } from '../types';

// Union type of all valid Vercel AI Gateway model IDs
export type VercelGatewayModel =
  // OpenAI models
  | 'openai/gpt-3.5-turbo'
  | 'openai/gpt-3.5-turbo-0125'
  | 'openai/gpt-3.5-turbo-1106'
  | 'openai/gpt-4'
  | 'openai/gpt-4-0125-preview'
  | 'openai/gpt-4-0613'
  | 'openai/gpt-4-1106-preview'
  | 'openai/gpt-4-turbo'
  | 'openai/gpt-4-turbo-2024-04-09'
  | 'openai/gpt-4-turbo-preview'
  | 'openai/gpt-4.1'
  | 'openai/gpt-4.1-2025-04-14'
  | 'openai/gpt-4.1-mini'
  | 'openai/gpt-4.1-mini-2025-04-14'
  | 'openai/gpt-4.1-nano'
  | 'openai/gpt-4.1-nano-2025-04-14'
  | 'openai/gpt-4o'
  | 'openai/gpt-4o-2024-05-13'
  | 'openai/gpt-4o-2024-08-06'
  | 'openai/gpt-4o-2024-11-20'
  | 'openai/gpt-4o-mini'
  | 'openai/gpt-4o-mini-2024-07-18'
  | 'openai/gpt-5'
  | 'openai/gpt-5-2025-08-07'
  | 'openai/gpt-5-chat-latest'
  | 'openai/gpt-5-mini'
  | 'openai/gpt-5-mini-2025-08-07'
  | 'openai/gpt-5-nano'
  | 'openai/gpt-5-nano-2025-08-07'
  | 'openai/o1'
  | 'openai/o1-2024-12-17'
  | 'openai/o1-pro'
  | 'openai/o1-pro-2025-03-19'
  | 'openai/o3'
  | 'openai/o3-2025-04-16'
  | 'openai/o3-deep-research'
  | 'openai/o3-deep-research-2025-06-26'
  | 'openai/o3-mini'
  | 'openai/o3-mini-2025-01-31'
  | 'openai/o3-pro'
  | 'openai/o3-pro-2025-06-10'
  // Anthropic models
  | 'anthropic/claude-3-haiku'
  | 'anthropic/claude-3-opus'
  | 'anthropic/claude-3.5-haiku'
  | 'anthropic/claude-3.5-haiku-20241022'
  | 'anthropic/claude-3.5-sonnet'
  | 'anthropic/claude-3.5-sonnet-20240620'
  | 'anthropic/claude-3.7-sonnet'
  | 'anthropic/claude-3.7-sonnet:thinking'
  | 'anthropic/claude-opus-4'
  | 'anthropic/claude-opus-4.1'
  | 'anthropic/claude-sonnet-4'
  | 'anthropic/claude-sonnet-4.5'
  | 'anthropic/claude-sonnet-4-5-20250929'
  // Google Gemini models
  | 'google/gemini-2.0-flash'
  | 'google/gemini-2.0-flash-001'
  | 'google/gemini-2.0-flash-exp'
  | 'google/gemini-2.0-flash-exp-image-generation'
  | 'google/gemini-2.0-flash-lite'
  | 'google/gemini-2.0-flash-lite-001'
  | 'google/gemini-2.0-flash-lite-preview'
  | 'google/gemini-2.0-flash-lite-preview-02-05'
  | 'google/gemini-2.0-flash-lite-preview'
  | 'google/gemini-2.0-flash-thinking-exp'
  | 'google/gemini-2.0-flash-thinking-exp-01-21'
  | 'google/gemini-2.0-flash-thinking-exp-1219'
  | 'google/gemini-2.5-flash'
  | 'google/gemini-2.5-flash-image-preview'
  | 'google/gemini-2.5-flash-lite'
  | 'google/gemini-2.5-flash-lite-preview-06-17'
  | 'google/gemini-2.5-flash-preview-05-20'
  | 'google/gemini-2.5-flash-preview-tts'
  | 'google/gemini-2.5-pro'
  | 'google/gemini-2.5-pro-preview-03-25'
  | 'google/gemini-2.5-pro-preview-05-06'
  | 'google/gemini-2.5-pro-preview-06-05'
  | 'google/gemini-2.5-pro-preview-tts'
  | 'google/gemini-2.5-flash-image-preview'
  // Speech and Transcription models
  | 'openai/whisper-1'
  | 'openai/tts-1'
  | 'openai/tts-1-hd';

export const VercelGatewayModels: SupportedModel[] = [
  // OpenAI models with Vercel Gateway pricing (same as OpenAI but through gateway)
  {
    model_id: 'openai/gpt-3.5-turbo',
    input_cost_per_token: 0.0000005,
    output_cost_per_token: 0.0000015,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/gpt-3.5-turbo-0125',
    input_cost_per_token: 0.0000005,
    output_cost_per_token: 0.0000015,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/gpt-3.5-turbo-1106',
    input_cost_per_token: 0.0000005,
    output_cost_per_token: 0.0000015,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/gpt-4',
    input_cost_per_token: 0.00003,
    output_cost_per_token: 0.00006,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/gpt-4-0125-preview',
    input_cost_per_token: 0.00001,
    output_cost_per_token: 0.00003,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/gpt-4-0613',
    input_cost_per_token: 0.00003,
    output_cost_per_token: 0.00006,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/gpt-4-1106-preview',
    input_cost_per_token: 0.00001,
    output_cost_per_token: 0.00003,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/gpt-4-turbo',
    input_cost_per_token: 0.00001,
    output_cost_per_token: 0.00003,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/gpt-4-turbo-2024-04-09',
    input_cost_per_token: 0.00001,
    output_cost_per_token: 0.00003,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/gpt-4-turbo-preview',
    input_cost_per_token: 0.00001,
    output_cost_per_token: 0.00003,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/gpt-4.1',
    input_cost_per_token: 0.00001,
    output_cost_per_token: 0.00003,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/gpt-4.1-2025-04-14',
    input_cost_per_token: 0.00001,
    output_cost_per_token: 0.00003,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/gpt-4.1-mini',
    input_cost_per_token: 0.00000015,
    output_cost_per_token: 0.0000006,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/gpt-4.1-mini-2025-04-14',
    input_cost_per_token: 0.00000015,
    output_cost_per_token: 0.0000006,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/gpt-4.1-nano',
    input_cost_per_token: 0.0000001,
    output_cost_per_token: 0.0000004,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/gpt-4.1-nano-2025-04-14',
    input_cost_per_token: 0.0000001,
    output_cost_per_token: 0.0000004,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/gpt-4o',
    input_cost_per_token: 0.000005,
    output_cost_per_token: 0.000015,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/gpt-4o-2024-05-13',
    input_cost_per_token: 0.000005,
    output_cost_per_token: 0.000015,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/gpt-4o-2024-08-06',
    input_cost_per_token: 0.000005,
    output_cost_per_token: 0.000015,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/gpt-4o-2024-11-20',
    input_cost_per_token: 0.000005,
    output_cost_per_token: 0.000015,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/gpt-4o-mini',
    input_cost_per_token: 0.00000015,
    output_cost_per_token: 0.0000006,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/gpt-4o-mini-2024-07-18',
    input_cost_per_token: 0.00000015,
    output_cost_per_token: 0.0000006,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/gpt-5',
    input_cost_per_token: 0.00001,
    output_cost_per_token: 0.00003,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/gpt-5-2025-08-07',
    input_cost_per_token: 0.00001,
    output_cost_per_token: 0.00003,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/gpt-5-chat-latest',
    input_cost_per_token: 0.00001,
    output_cost_per_token: 0.00003,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/gpt-5-mini',
    input_cost_per_token: 0.00000015,
    output_cost_per_token: 0.0000006,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/gpt-5-mini-2025-08-07',
    input_cost_per_token: 0.00000015,
    output_cost_per_token: 0.0000006,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/gpt-5-nano',
    input_cost_per_token: 0.0000001,
    output_cost_per_token: 0.0000004,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/gpt-5-nano-2025-08-07',
    input_cost_per_token: 0.0000001,
    output_cost_per_token: 0.0000004,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/o1',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.00006,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/o1-2024-12-17',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.00006,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/o1-pro',
    input_cost_per_token: 0.00006,
    output_cost_per_token: 0.00024,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/o1-pro-2025-03-19',
    input_cost_per_token: 0.00006,
    output_cost_per_token: 0.00024,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/o3',
    input_cost_per_token: 0.00003,
    output_cost_per_token: 0.00012,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/o3-2025-04-16',
    input_cost_per_token: 0.00003,
    output_cost_per_token: 0.00012,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/o3-deep-research',
    input_cost_per_token: 0.00006,
    output_cost_per_token: 0.00024,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/o3-deep-research-2025-06-26',
    input_cost_per_token: 0.00006,
    output_cost_per_token: 0.00024,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/o3-mini',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.00006,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/o3-mini-2025-01-31',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.00006,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/o3-pro',
    input_cost_per_token: 0.00006,
    output_cost_per_token: 0.00024,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/o3-pro-2025-06-10',
    input_cost_per_token: 0.00006,
    output_cost_per_token: 0.00024,
    provider: 'VercelGateway',
  },
  // Anthropic models with Vercel Gateway pricing
  {
    model_id: 'anthropic/claude-3-haiku',
    input_cost_per_token: 0.00000025,
    output_cost_per_token: 0.00000125,
    provider: 'VercelGateway',
  },
  {
    model_id: 'anthropic/claude-3-opus',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.000075,
    provider: 'VercelGateway',
  },
  {
    model_id: 'anthropic/claude-3.5-haiku',
    input_cost_per_token: 0.0000008,
    output_cost_per_token: 0.000004,
    provider: 'VercelGateway',
  },
  {
    model_id: 'anthropic/claude-3.5-haiku-20241022',
    input_cost_per_token: 0.0000008,
    output_cost_per_token: 0.000004,
    provider: 'VercelGateway',
  },
  {
    model_id: 'anthropic/claude-3.5-sonnet',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'VercelGateway',
  },
  {
    model_id: 'anthropic/claude-3.5-sonnet-20240620',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'VercelGateway',
  },
  {
    model_id: 'anthropic/claude-3.7-sonnet',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'VercelGateway',
  },
  {
    model_id: 'anthropic/claude-3.7-sonnet:thinking',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'VercelGateway',
  },
  {
    model_id: 'anthropic/claude-opus-4',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.000075,
    provider: 'VercelGateway',
  },
  {
    model_id: 'anthropic/claude-opus-4.1',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.000075,
    provider: 'VercelGateway',
  },
  {
    model_id: 'anthropic/claude-sonnet-4',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'VercelGateway',
  },
  {
    model_id: 'anthropic/claude-sonnet-4.5',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'VercelGateway',
  },
  {
    model_id: 'anthropic/claude-sonnet-4-5-20250929',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'VercelGateway',
  },
  // Google Gemini models with Vercel Gateway pricing
  {
    model_id: 'google/gemini-2.0-flash',
    input_cost_per_token: 0.000000075,
    output_cost_per_token: 0.0000003,
    provider: 'VercelGateway',
  },
  {
    model_id: 'google/gemini-2.0-flash-001',
    input_cost_per_token: 0.000000075,
    output_cost_per_token: 0.0000003,
    provider: 'VercelGateway',
  },
  {
    model_id: 'google/gemini-2.0-flash-exp',
    input_cost_per_token: 0.000000075,
    output_cost_per_token: 0.0000003,
    provider: 'VercelGateway',
  },
  {
    model_id: 'google/gemini-2.0-flash-exp-image-generation',
    input_cost_per_token: 0.000000075,
    output_cost_per_token: 0.0000003,
    provider: 'VercelGateway',
  },
  {
    model_id: 'google/gemini-2.0-flash-lite',
    input_cost_per_token: 0.0000000375,
    output_cost_per_token: 0.00000015,
    provider: 'VercelGateway',
  },
  {
    model_id: 'google/gemini-2.0-flash-lite-001',
    input_cost_per_token: 0.0000000375,
    output_cost_per_token: 0.00000015,
    provider: 'VercelGateway',
  },
  {
    model_id: 'google/gemini-2.0-flash-lite-preview',
    input_cost_per_token: 0.0000000375,
    output_cost_per_token: 0.00000015,
    provider: 'VercelGateway',
  },
  {
    model_id: 'google/gemini-2.0-flash-lite-preview-02-05',
    input_cost_per_token: 0.0000000375,
    output_cost_per_token: 0.00000015,
    provider: 'VercelGateway',
  },
  {
    model_id: 'google/gemini-2.0-flash-lite-preview',
    input_cost_per_token: 0.0000000375,
    output_cost_per_token: 0.00000015,
    provider: 'VercelGateway',
  },
  {
    model_id: 'google/gemini-2.0-flash-thinking-exp',
    input_cost_per_token: 0.000000075,
    output_cost_per_token: 0.0000003,
    provider: 'VercelGateway',
  },
  {
    model_id: 'google/gemini-2.0-flash-thinking-exp-01-21',
    input_cost_per_token: 0.000000075,
    output_cost_per_token: 0.0000003,
    provider: 'VercelGateway',
  },
  {
    model_id: 'google/gemini-2.0-flash-thinking-exp-1219',
    input_cost_per_token: 0.000000075,
    output_cost_per_token: 0.0000003,
    provider: 'VercelGateway',
  },
  {
    model_id: 'google/gemini-2.5-flash',
    input_cost_per_token: 0.000000075,
    output_cost_per_token: 0.0000003,
    provider: 'VercelGateway',
  },
  {
    model_id: 'google/gemini-2.5-flash-image-preview',
    input_cost_per_token: 0.000000075,
    output_cost_per_token: 0.0000003,
    provider: 'VercelGateway',
  },
  {
    model_id: 'google/gemini-2.5-flash-lite',
    input_cost_per_token: 0.0000000375,
    output_cost_per_token: 0.00000015,
    provider: 'VercelGateway',
  },
  {
    model_id: 'google/gemini-2.5-flash-lite-preview-06-17',
    input_cost_per_token: 0.0000000375,
    output_cost_per_token: 0.00000015,
    provider: 'VercelGateway',
  },
  {
    model_id: 'google/gemini-2.5-flash-preview-05-20',
    input_cost_per_token: 0.000000075,
    output_cost_per_token: 0.0000003,
    provider: 'VercelGateway',
  },
  {
    model_id: 'google/gemini-2.5-flash-preview-tts',
    input_cost_per_token: 0.000000075,
    output_cost_per_token: 0.0000003,
    provider: 'VercelGateway',
  },
  {
    model_id: 'google/gemini-2.5-pro',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.000005,
    provider: 'VercelGateway',
  },
  {
    model_id: 'google/gemini-2.5-pro-preview-03-25',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.000005,
    provider: 'VercelGateway',
  },
  {
    model_id: 'google/gemini-2.5-pro-preview-05-06',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.000005,
    provider: 'VercelGateway',
  },
  {
    model_id: 'google/gemini-2.5-pro-preview-06-05',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.000005,
    provider: 'VercelGateway',
  },
  {
    model_id: 'google/gemini-2.5-pro-preview-tts',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.000005,
    provider: 'VercelGateway',
  },
  {
    model_id: 'google/gemini-2.5-flash-image-preview',
    input_cost_per_token: 0.000000075,
    output_cost_per_token: 0.0000003,
    provider: 'VercelGateway',
  },
  // Speech and Transcription models
  {
    model_id: 'openai/whisper-1',
    input_cost_per_token: 0.000006, // Per minute of audio
    output_cost_per_token: 0.0, // No output tokens for transcription
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/tts-1',
    input_cost_per_token: 0.000015, // Per 1K characters
    output_cost_per_token: 0.0, // No output tokens for speech
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/tts-1-hd',
    input_cost_per_token: 0.00003, // Per 1K characters
    output_cost_per_token: 0.0, // No output tokens for speech
    provider: 'VercelGateway',
  },
];
