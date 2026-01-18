import { SupportedModel } from '../types';

// Union type of all valid VercelAIGateway model IDs
export type VercelAIGatewayModel =
  | 'alibaba/qwen-3-14b'
  | 'alibaba/qwen-3-235b'
  | 'alibaba/qwen-3-30b'
  | 'alibaba/qwen-3-32b'
  | 'alibaba/qwen3-coder'
  | 'alibaba/qwen3-coder-30b-a3b'
  | 'alibaba/qwen3-coder-plus'
  | 'alibaba/qwen3-max'
  | 'alibaba/qwen3-max-preview'
  | 'alibaba/qwen3-next-80b-a3b-instruct'
  | 'alibaba/qwen3-next-80b-a3b-thinking'
  | 'alibaba/qwen3-vl-instruct'
  | 'alibaba/qwen3-vl-thinking'
  | 'amazon/nova-lite'
  | 'amazon/nova-micro'
  | 'amazon/nova-pro'
  | 'anthropic/claude-3-haiku'
  | 'anthropic/claude-3-opus'
  | 'anthropic/claude-3.5-haiku'
  | 'anthropic/claude-3.5-sonnet'
  | 'anthropic/claude-3.5-sonnet-20240620'
  | 'anthropic/claude-3.7-sonnet'
  | 'anthropic/claude-haiku-4.5'
  | 'anthropic/claude-opus-4'
  | 'anthropic/claude-opus-4.1'
  | 'anthropic/claude-sonnet-4'
  | 'anthropic/claude-sonnet-4.5'
  | 'cohere/command-a'
  | 'cohere/command-r'
  | 'cohere/command-r-plus'
  | 'deepseek/deepseek-r1'
  | 'deepseek/deepseek-r1-distill-llama-70b'
  | 'deepseek/deepseek-v3'
  | 'deepseek/deepseek-v3.1'
  | 'deepseek/deepseek-v3.1-base'
  | 'deepseek/deepseek-v3.1-terminus'
  | 'deepseek/deepseek-v3.2-exp'
  | 'deepseek/deepseek-v3.2-exp-thinking'
  | 'google/gemini-2.0-flash'
  | 'google/gemini-2.0-flash-lite'
  | 'google/gemini-2.5-flash'
  | 'google/gemini-2.5-flash-image'
  | 'google/gemini-2.5-flash-image-preview'
  | 'google/gemini-2.5-flash-lite'
  | 'google/gemini-2.5-flash-lite-preview-09-2025'
  | 'google/gemini-2.5-flash-preview-09-2025'
  | 'google/gemini-2.5-pro'
  | 'google/gemma-2-9b'
  | 'inception/mercury-coder-small'
  | 'meituan/longcat-flash-chat'
  | 'meituan/longcat-flash-thinking'
  | 'meta/llama-3-70b'
  | 'meta/llama-3-8b'
  | 'meta/llama-3.1-70b'
  | 'meta/llama-3.1-8b'
  | 'meta/llama-3.2-11b'
  | 'meta/llama-3.2-1b'
  | 'meta/llama-3.2-3b'
  | 'meta/llama-3.2-90b'
  | 'meta/llama-3.3-70b'
  | 'meta/llama-4-maverick'
  | 'meta/llama-4-scout'
  | 'minimax/minimax-m2'
  | 'mistral/codestral'
  | 'mistral/devstral-small'
  | 'mistral/magistral-medium'
  | 'mistral/magistral-medium-2506'
  | 'mistral/magistral-small'
  | 'mistral/magistral-small-2506'
  | 'mistral/ministral-3b'
  | 'mistral/ministral-8b'
  | 'mistral/mistral-large'
  | 'mistral/mistral-medium'
  | 'mistral/mistral-small'
  | 'mistral/mixtral-8x22b-instruct'
  | 'mistral/pixtral-12b'
  | 'mistral/pixtral-large'
  | 'moonshotai/kimi-k2'
  | 'moonshotai/kimi-k2-0905'
  | 'moonshotai/kimi-k2-turbo'
  | 'morph/morph-v3-fast'
  | 'morph/morph-v3-large'
  | 'openai/gpt-3.5-turbo'
  | 'openai/gpt-3.5-turbo-instruct'
  | 'openai/gpt-4-turbo'
  | 'openai/gpt-4.1'
  | 'openai/gpt-4.1-mini'
  | 'openai/gpt-4.1-nano'
  | 'openai/gpt-4o'
  | 'openai/gpt-4o-mini'
  | 'openai/gpt-5'
  | 'openai/gpt-5-codex'
  | 'openai/gpt-5-mini'
  | 'openai/gpt-5-nano'
  | 'openai/gpt-5-pro'
  | 'openai/gpt-oss-120b'
  | 'openai/gpt-oss-20b'
  | 'openai/o1'
  | 'openai/o3'
  | 'openai/o3-mini'
  | 'openai/o4-mini'
  | 'perplexity/sonar'
  | 'perplexity/sonar-pro'
  | 'perplexity/sonar-reasoning'
  | 'perplexity/sonar-reasoning-pro'
  | 'stealth/sonoma-dusk-alpha'
  | 'stealth/sonoma-sky-alpha'
  | 'vercel/v0-1.0-md'
  | 'vercel/v0-1.5-md'
  | 'xai/grok-2'
  | 'xai/grok-2-vision'
  | 'xai/grok-3'
  | 'xai/grok-3-fast'
  | 'xai/grok-3-mini'
  | 'xai/grok-3-mini-fast'
  | 'xai/grok-4'
  | 'xai/grok-4-fast-non-reasoning'
  | 'xai/grok-4-fast-reasoning'
  | 'xai/grok-code-fast-1'
  | 'zai/glm-4.5'
  | 'zai/glm-4.5-air'
  | 'zai/glm-4.5v'
  | 'zai/glm-4.6';

export const VercelAIGatewayModels: SupportedModel[] = [
  {
    model_id: 'alibaba/qwen-3-14b',
    input_cost_per_token: 6e-8,
    output_cost_per_token: 2.4e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'alibaba/qwen-3-235b',
    input_cost_per_token: 1.3e-7,
    output_cost_per_token: 6e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'alibaba/qwen-3-30b',
    input_cost_per_token: 8e-8,
    output_cost_per_token: 2.9e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'alibaba/qwen-3-32b',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 3e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'alibaba/qwen3-coder',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.0000016,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'alibaba/qwen3-coder-30b-a3b',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 6e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'alibaba/qwen3-coder-plus',
    input_cost_per_token: 0.000001,
    output_cost_per_token: 0.000005,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'alibaba/qwen3-max',
    input_cost_per_token: 0.0000012,
    output_cost_per_token: 0.000006,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'alibaba/qwen3-max-preview',
    input_cost_per_token: 0.0000012,
    output_cost_per_token: 0.000006,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'alibaba/qwen3-next-80b-a3b-instruct',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 0.0000015,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'alibaba/qwen3-next-80b-a3b-thinking',
    input_cost_per_token: 1.4e-7,
    output_cost_per_token: 0.0000014,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'alibaba/qwen3-vl-instruct',
    input_cost_per_token: 7e-7,
    output_cost_per_token: 0.0000028,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'alibaba/qwen3-vl-thinking',
    input_cost_per_token: 7e-7,
    output_cost_per_token: 0.0000084,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'amazon/nova-lite',
    input_cost_per_token: 6e-8,
    output_cost_per_token: 2.4e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'amazon/nova-micro',
    input_cost_per_token: 3.5e-8,
    output_cost_per_token: 1.4e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'amazon/nova-pro',
    input_cost_per_token: 8e-7,
    output_cost_per_token: 0.0000032,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'anthropic/claude-3-haiku',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 0.00000125,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'anthropic/claude-3-opus',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.000075,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'anthropic/claude-3.5-haiku',
    input_cost_per_token: 8e-7,
    output_cost_per_token: 0.000004,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'anthropic/claude-3.5-sonnet',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'anthropic/claude-3.5-sonnet-20240620',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'anthropic/claude-3.7-sonnet',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'anthropic/claude-haiku-4.5',
    input_cost_per_token: 0.000001,
    output_cost_per_token: 0.000005,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'anthropic/claude-opus-4',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.000075,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'anthropic/claude-opus-4.1',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.000075,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'anthropic/claude-sonnet-4',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'anthropic/claude-sonnet-4.5',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'cohere/command-a',
    input_cost_per_token: 0.0000025,
    output_cost_per_token: 0.00001,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'cohere/command-r',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 6e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'cohere/command-r-plus',
    input_cost_per_token: 0.0000025,
    output_cost_per_token: 0.00001,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'deepseek/deepseek-r1',
    input_cost_per_token: 7.9e-7,
    output_cost_per_token: 0.000004,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'deepseek/deepseek-r1-distill-llama-70b',
    input_cost_per_token: 7.5e-7,
    output_cost_per_token: 9.9e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'deepseek/deepseek-v3',
    input_cost_per_token: 7.7e-7,
    output_cost_per_token: 7.7e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'deepseek/deepseek-v3.1',
    input_cost_per_token: 1.999e-7,
    output_cost_per_token: 8.001e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'deepseek/deepseek-v3.1-base',
    input_cost_per_token: 1.999e-7,
    output_cost_per_token: 8.001e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'deepseek/deepseek-v3.1-terminus',
    input_cost_per_token: 2.7e-7,
    output_cost_per_token: 0.000001,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'deepseek/deepseek-v3.2-exp',
    input_cost_per_token: 2.7e-7,
    output_cost_per_token: 4.1e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'deepseek/deepseek-v3.2-exp-thinking',
    input_cost_per_token: 2.8e-7,
    output_cost_per_token: 4.2e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'google/gemini-2.0-flash',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 4e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'google/gemini-2.0-flash-lite',
    input_cost_per_token: 7.5e-8,
    output_cost_per_token: 3e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'google/gemini-2.5-flash',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000025,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'google/gemini-2.5-flash-image',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000025,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'google/gemini-2.5-flash-image-preview',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000025,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'google/gemini-2.5-flash-lite',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 4e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'google/gemini-2.5-flash-lite-preview-09-2025',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 4e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'google/gemini-2.5-flash-preview-09-2025',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000025,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'google/gemini-2.5-pro',
    input_cost_per_token: 0.0000025,
    output_cost_per_token: 0.000015,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'google/gemma-2-9b',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 2e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'inception/mercury-coder-small',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 0.000001,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'meituan/longcat-flash-chat',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'meituan/longcat-flash-thinking',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 0.0000015,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'meta/llama-3-70b',
    input_cost_per_token: 5.9e-7,
    output_cost_per_token: 7.9e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'meta/llama-3-8b',
    input_cost_per_token: 5e-8,
    output_cost_per_token: 8e-8,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'meta/llama-3.1-70b',
    input_cost_per_token: 7.2e-7,
    output_cost_per_token: 7.2e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'meta/llama-3.1-8b',
    input_cost_per_token: 5e-8,
    output_cost_per_token: 8e-8,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'meta/llama-3.2-11b',
    input_cost_per_token: 1.6e-7,
    output_cost_per_token: 1.6e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'meta/llama-3.2-1b',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 1e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'meta/llama-3.2-3b',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 1.5e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'meta/llama-3.2-90b',
    input_cost_per_token: 7.2e-7,
    output_cost_per_token: 7.2e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'meta/llama-3.3-70b',
    input_cost_per_token: 7.2e-7,
    output_cost_per_token: 7.2e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'meta/llama-4-maverick',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 6e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'meta/llama-4-scout',
    input_cost_per_token: 8e-8,
    output_cost_per_token: 3e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'minimax/minimax-m2',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'mistral/codestral',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 9e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'mistral/devstral-small',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 3e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'mistral/magistral-medium',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000005,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'mistral/magistral-medium-2506',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000005,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'mistral/magistral-small',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 0.0000015,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'mistral/magistral-small-2506',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 0.0000015,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'mistral/ministral-3b',
    input_cost_per_token: 4e-8,
    output_cost_per_token: 4e-8,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'mistral/ministral-8b',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 1e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'mistral/mistral-large',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000006,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'mistral/mistral-medium',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.000002,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'mistral/mistral-small',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 3e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'mistral/mixtral-8x22b-instruct',
    input_cost_per_token: 0.0000012,
    output_cost_per_token: 0.0000012,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'mistral/pixtral-12b',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 1.5e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'mistral/pixtral-large',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000006,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'moonshotai/kimi-k2',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 0.000002,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'moonshotai/kimi-k2-0905',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 0.0000025,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'moonshotai/kimi-k2-turbo',
    input_cost_per_token: 0.0000024,
    output_cost_per_token: 0.00001,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'morph/morph-v3-fast',
    input_cost_per_token: 8e-7,
    output_cost_per_token: 0.0000012,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'morph/morph-v3-large',
    input_cost_per_token: 9e-7,
    output_cost_per_token: 0.0000019,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'openai/gpt-3.5-turbo',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 0.0000015,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'openai/gpt-3.5-turbo-instruct',
    input_cost_per_token: 0.0000015,
    output_cost_per_token: 0.000002,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'openai/gpt-4-turbo',
    input_cost_per_token: 0.00001,
    output_cost_per_token: 0.00003,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'openai/gpt-4.1',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000008,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'openai/gpt-4.1-mini',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.0000016,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'openai/gpt-4.1-nano',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 4e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'openai/gpt-4o',
    input_cost_per_token: 0.0000025,
    output_cost_per_token: 0.00001,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'openai/gpt-4o-mini',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 6e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'openai/gpt-5',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'openai/gpt-5-codex',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'openai/gpt-5-mini',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 0.000002,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'openai/gpt-5-nano',
    input_cost_per_token: 5e-8,
    output_cost_per_token: 4e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'openai/gpt-5-pro',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.00012,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'openai/gpt-oss-120b',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 5e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'openai/gpt-oss-20b',
    input_cost_per_token: 7e-8,
    output_cost_per_token: 3e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'openai/o1',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.00006,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'openai/o3',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000008,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'openai/o3-mini',
    input_cost_per_token: 0.0000011,
    output_cost_per_token: 0.0000044,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'openai/o4-mini',
    input_cost_per_token: 0.0000011,
    output_cost_per_token: 0.0000044,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'perplexity/sonar',
    input_cost_per_token: 0.000001,
    output_cost_per_token: 0.000001,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'perplexity/sonar-pro',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'perplexity/sonar-reasoning',
    input_cost_per_token: 0.000001,
    output_cost_per_token: 0.000005,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'perplexity/sonar-reasoning-pro',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000008,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'stealth/sonoma-dusk-alpha',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 5e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'stealth/sonoma-sky-alpha',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 5e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'vercel/v0-1.0-md',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'vercel/v0-1.5-md',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'xai/grok-2',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.00001,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'xai/grok-2-vision',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.00001,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'xai/grok-3',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'xai/grok-3-fast',
    input_cost_per_token: 0.000005,
    output_cost_per_token: 0.000025,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'xai/grok-3-mini',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 5e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'xai/grok-3-mini-fast',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 0.000004,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'xai/grok-4',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'xai/grok-4-fast-non-reasoning',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 5e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'xai/grok-4-fast-reasoning',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 5e-7,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'xai/grok-code-fast-1',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 0.0000015,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'zai/glm-4.5',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 0.0000022,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'zai/glm-4.5-air',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 0.0000011,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'zai/glm-4.5v',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 0.0000018,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'zai/glm-4.6',
    input_cost_per_token: 4.5e-7,
    output_cost_per_token: 0.0000018,
    provider: 'VercelAIGateway',
  },
];
