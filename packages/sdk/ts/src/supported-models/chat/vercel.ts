import { SupportedModel } from '../types';

// Union type of all valid Vercel model IDs
export type VercelModel =
  | 'alibaba/qwen-3-14b'
  | 'alibaba/qwen-3-235b'
  | 'alibaba/qwen-3-30b'
  | 'alibaba/qwen-3-32b'
  | 'alibaba/qwen3-235b-a22b-thinking'
  | 'alibaba/qwen3-coder'
  | 'alibaba/qwen3-coder-30b-a3b'
  | 'alibaba/qwen3-coder-next'
  | 'alibaba/qwen3-coder-plus'
  | 'alibaba/qwen3-max'
  | 'alibaba/qwen3-max-preview'
  | 'alibaba/qwen3-max-thinking'
  | 'alibaba/qwen3-next-80b-a3b-instruct'
  | 'alibaba/qwen3-next-80b-a3b-thinking'
  | 'alibaba/qwen3-vl-instruct'
  | 'alibaba/qwen3-vl-thinking'
  | 'alibaba/qwen3.5-flash'
  | 'alibaba/qwen3.5-plus'
  | 'amazon/nova-2-lite'
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
  | 'anthropic/claude-opus-4.5'
  | 'anthropic/claude-opus-4.6'
  | 'anthropic/claude-sonnet-4'
  | 'anthropic/claude-sonnet-4.5'
  | 'anthropic/claude-sonnet-4.6'
  | 'arcee-ai/trinity-large-preview'
  | 'arcee-ai/trinity-mini'
  | 'bytedance/seed-1.6'
  | 'bytedance/seed-1.8'
  | 'cohere/command-a'
  | 'deepseek/deepseek-r1'
  | 'deepseek/deepseek-v3'
  | 'deepseek/deepseek-v3.1'
  | 'deepseek/deepseek-v3.1-terminus'
  | 'deepseek/deepseek-v3.2'
  | 'deepseek/deepseek-v3.2-thinking'
  | 'google/gemini-2.0-flash'
  | 'google/gemini-2.0-flash-lite'
  | 'google/gemini-2.5-flash'
  | 'google/gemini-2.5-flash-image'
  | 'google/gemini-2.5-flash-lite'
  | 'google/gemini-2.5-pro'
  | 'google/gemini-3-flash'
  | 'google/gemini-3-pro-image'
  | 'google/gemini-3-pro-preview'
  | 'google/gemini-3.1-flash-image-preview'
  | 'google/gemini-3.1-flash-lite-preview'
  | 'google/gemini-3.1-pro-preview'
  | 'inception/mercury-2'
  | 'inception/mercury-coder-small'
  | 'kwaipilot/kat-coder-pro-v1'
  | 'meituan/longcat-flash-thinking'
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
  | 'minimax/minimax-m2.1'
  | 'minimax/minimax-m2.1-lightning'
  | 'minimax/minimax-m2.5'
  | 'minimax/minimax-m2.5-highspeed'
  | 'minimax/minimax-m2.7'
  | 'minimax/minimax-m2.7-highspeed'
  | 'mistral/codestral'
  | 'mistral/devstral-2'
  | 'mistral/devstral-small'
  | 'mistral/devstral-small-2'
  | 'mistral/magistral-medium'
  | 'mistral/magistral-small'
  | 'mistral/ministral-14b'
  | 'mistral/ministral-3b'
  | 'mistral/ministral-8b'
  | 'mistral/mistral-large-3'
  | 'mistral/mistral-medium'
  | 'mistral/mistral-nemo'
  | 'mistral/mistral-small'
  | 'mistral/mixtral-8x22b-instruct'
  | 'mistral/pixtral-12b'
  | 'mistral/pixtral-large'
  | 'moonshotai/kimi-k2'
  | 'moonshotai/kimi-k2-0905'
  | 'moonshotai/kimi-k2-thinking'
  | 'moonshotai/kimi-k2-thinking-turbo'
  | 'moonshotai/kimi-k2-turbo'
  | 'moonshotai/kimi-k2.5'
  | 'morph/morph-v3-fast'
  | 'morph/morph-v3-large'
  | 'nvidia/nemotron-3-nano-30b-a3b'
  | 'nvidia/nemotron-nano-12b-v2-vl'
  | 'nvidia/nemotron-nano-9b-v2'
  | 'openai/gpt-3.5-turbo'
  | 'openai/gpt-3.5-turbo-instruct'
  | 'openai/gpt-4-turbo'
  | 'openai/gpt-4.1'
  | 'openai/gpt-4.1-mini'
  | 'openai/gpt-4.1-nano'
  | 'openai/gpt-4o'
  | 'openai/gpt-4o-mini'
  | 'openai/gpt-4o-mini-search-preview'
  | 'openai/gpt-5'
  | 'openai/gpt-5-chat'
  | 'openai/gpt-5-codex'
  | 'openai/gpt-5-mini'
  | 'openai/gpt-5-nano'
  | 'openai/gpt-5-pro'
  | 'openai/gpt-5.1-codex'
  | 'openai/gpt-5.1-codex-max'
  | 'openai/gpt-5.1-codex-mini'
  | 'openai/gpt-5.1-instant'
  | 'openai/gpt-5.1-thinking'
  | 'openai/gpt-5.2'
  | 'openai/gpt-5.2-chat'
  | 'openai/gpt-5.2-codex'
  | 'openai/gpt-5.2-pro'
  | 'openai/gpt-5.3-chat'
  | 'openai/gpt-5.3-codex'
  | 'openai/gpt-5.4'
  | 'openai/gpt-5.4-mini'
  | 'openai/gpt-5.4-nano'
  | 'openai/gpt-5.4-pro'
  | 'openai/gpt-oss-120b'
  | 'openai/gpt-oss-20b'
  | 'openai/gpt-oss-safeguard-20b'
  | 'openai/o1'
  | 'openai/o3'
  | 'openai/o3-deep-research'
  | 'openai/o3-mini'
  | 'openai/o3-pro'
  | 'openai/o4-mini'
  | 'perplexity/sonar'
  | 'perplexity/sonar-pro'
  | 'perplexity/sonar-reasoning'
  | 'perplexity/sonar-reasoning-pro'
  | 'prime-intellect/intellect-3'
  | 'xai/grok-2-vision'
  | 'xai/grok-3'
  | 'xai/grok-3-fast'
  | 'xai/grok-3-mini'
  | 'xai/grok-3-mini-fast'
  | 'xai/grok-4'
  | 'xai/grok-4-fast-non-reasoning'
  | 'xai/grok-4-fast-reasoning'
  | 'xai/grok-4.1-fast-non-reasoning'
  | 'xai/grok-4.1-fast-reasoning'
  | 'xai/grok-4.20-multi-agent-beta'
  | 'xai/grok-4.20-non-reasoning-beta'
  | 'xai/grok-4.20-reasoning-beta'
  | 'xai/grok-code-fast-1'
  | 'xiaomi/mimo-v2-flash'
  | 'xiaomi/mimo-v2-pro'
  | 'zai/glm-4.5'
  | 'zai/glm-4.5-air'
  | 'zai/glm-4.5v'
  | 'zai/glm-4.6'
  | 'zai/glm-4.6v'
  | 'zai/glm-4.7'
  | 'zai/glm-4.7-flash'
  | 'zai/glm-4.7-flashx'
  | 'zai/glm-5'
  | 'zai/glm-5-turbo';

export const VercelModels: SupportedModel[] = [
  {
    model_id: 'alibaba/qwen-3-14b',
    input_cost_per_token: 1.2e-7,
    output_cost_per_token: 2.4e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'alibaba/qwen-3-235b',
    input_cost_per_token: 7.1e-8,
    output_cost_per_token: 4.63e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'alibaba/qwen-3-30b',
    input_cost_per_token: 8e-8,
    output_cost_per_token: 2.9e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'alibaba/qwen-3-32b',
    input_cost_per_token: 2.9e-7,
    output_cost_per_token: 5.9e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'alibaba/qwen3-235b-a22b-thinking',
    input_cost_per_token: 2.3e-7,
    output_cost_per_token: 0.0000023,
    provider: 'Vercel',
  },
  {
    model_id: 'alibaba/qwen3-coder',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.0000016,
    provider: 'Vercel',
  },
  {
    model_id: 'alibaba/qwen3-coder-30b-a3b',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 6e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'alibaba/qwen3-coder-next',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 0.0000012,
    provider: 'Vercel',
  },
  {
    model_id: 'alibaba/qwen3-coder-plus',
    input_cost_per_token: 0.000001,
    output_cost_per_token: 0.000005,
    provider: 'Vercel',
  },
  {
    model_id: 'alibaba/qwen3-max',
    input_cost_per_token: 0.0000012,
    output_cost_per_token: 0.000006,
    provider: 'Vercel',
  },
  {
    model_id: 'alibaba/qwen3-max-preview',
    input_cost_per_token: 0.0000012,
    output_cost_per_token: 0.000006,
    provider: 'Vercel',
  },
  {
    model_id: 'alibaba/qwen3-max-thinking',
    input_cost_per_token: 0.0000012,
    output_cost_per_token: 0.000006,
    provider: 'Vercel',
  },
  {
    model_id: 'alibaba/qwen3-next-80b-a3b-instruct',
    input_cost_per_token: 9e-8,
    output_cost_per_token: 0.0000011,
    provider: 'Vercel',
  },
  {
    model_id: 'alibaba/qwen3-next-80b-a3b-thinking',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 0.0000012,
    provider: 'Vercel',
  },
  {
    model_id: 'alibaba/qwen3-vl-instruct',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 8.8e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'alibaba/qwen3-vl-thinking',
    input_cost_per_token: 2.2e-7,
    output_cost_per_token: 8.8e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'alibaba/qwen3.5-flash',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 4e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'alibaba/qwen3.5-plus',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.0000024,
    provider: 'Vercel',
  },
  {
    model_id: 'amazon/nova-2-lite',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000025,
    provider: 'Vercel',
  },
  {
    model_id: 'amazon/nova-lite',
    input_cost_per_token: 6e-8,
    output_cost_per_token: 2.4e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'amazon/nova-micro',
    input_cost_per_token: 3.5e-8,
    output_cost_per_token: 1.4e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'amazon/nova-pro',
    input_cost_per_token: 8e-7,
    output_cost_per_token: 0.0000032,
    provider: 'Vercel',
  },
  {
    model_id: 'anthropic/claude-3-haiku',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 0.00000125,
    provider: 'Vercel',
  },
  {
    model_id: 'anthropic/claude-3-opus',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.000075,
    provider: 'Vercel',
  },
  {
    model_id: 'anthropic/claude-3.5-haiku',
    input_cost_per_token: 8e-7,
    output_cost_per_token: 0.000004,
    provider: 'Vercel',
  },
  {
    model_id: 'anthropic/claude-3.5-sonnet',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'Vercel',
  },
  {
    model_id: 'anthropic/claude-3.5-sonnet-20240620',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'Vercel',
  },
  {
    model_id: 'anthropic/claude-3.7-sonnet',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'Vercel',
  },
  {
    model_id: 'anthropic/claude-haiku-4.5',
    input_cost_per_token: 0.000001,
    output_cost_per_token: 0.000005,
    provider: 'Vercel',
  },
  {
    model_id: 'anthropic/claude-opus-4',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.000075,
    provider: 'Vercel',
  },
  {
    model_id: 'anthropic/claude-opus-4.1',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.000075,
    provider: 'Vercel',
  },
  {
    model_id: 'anthropic/claude-opus-4.5',
    input_cost_per_token: 0.000005,
    output_cost_per_token: 0.000025,
    provider: 'Vercel',
  },
  {
    model_id: 'anthropic/claude-opus-4.6',
    input_cost_per_token: 0.000005,
    output_cost_per_token: 0.000025,
    provider: 'Vercel',
  },
  {
    model_id: 'anthropic/claude-sonnet-4',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'Vercel',
  },
  {
    model_id: 'anthropic/claude-sonnet-4.5',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'Vercel',
  },
  {
    model_id: 'anthropic/claude-sonnet-4.6',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'Vercel',
  },
  {
    model_id: 'arcee-ai/trinity-large-preview',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 0.000001,
    provider: 'Vercel',
  },
  {
    model_id: 'arcee-ai/trinity-mini',
    input_cost_per_token: 4.5e-8,
    output_cost_per_token: 1.5e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'bytedance/seed-1.6',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 0.000002,
    provider: 'Vercel',
  },
  {
    model_id: 'bytedance/seed-1.8',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 0.000002,
    provider: 'Vercel',
  },
  {
    model_id: 'cohere/command-a',
    input_cost_per_token: 0.0000025,
    output_cost_per_token: 0.00001,
    provider: 'Vercel',
  },
  {
    model_id: 'deepseek/deepseek-r1',
    input_cost_per_token: 0.00000135,
    output_cost_per_token: 0.0000054,
    provider: 'Vercel',
  },
  {
    model_id: 'deepseek/deepseek-v3',
    input_cost_per_token: 7.7e-7,
    output_cost_per_token: 7.7e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'deepseek/deepseek-v3.1',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 0.0000015,
    provider: 'Vercel',
  },
  {
    model_id: 'deepseek/deepseek-v3.1-terminus',
    input_cost_per_token: 2.7e-7,
    output_cost_per_token: 0.000001,
    provider: 'Vercel',
  },
  {
    model_id: 'deepseek/deepseek-v3.2',
    input_cost_per_token: 2.8e-7,
    output_cost_per_token: 4.2e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'deepseek/deepseek-v3.2-thinking',
    input_cost_per_token: 2.8e-7,
    output_cost_per_token: 4.2e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'google/gemini-2.0-flash',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 6e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'google/gemini-2.0-flash-lite',
    input_cost_per_token: 7.5e-8,
    output_cost_per_token: 3e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'google/gemini-2.5-flash',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000025,
    provider: 'Vercel',
  },
  {
    model_id: 'google/gemini-2.5-flash-image',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000025,
    provider: 'Vercel',
  },
  {
    model_id: 'google/gemini-2.5-flash-lite',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 4e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'google/gemini-2.5-pro',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'Vercel',
  },
  {
    model_id: 'google/gemini-3-flash',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 0.000003,
    provider: 'Vercel',
  },
  {
    model_id: 'google/gemini-3-pro-image',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000012,
    provider: 'Vercel',
  },
  {
    model_id: 'google/gemini-3-pro-preview',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000012,
    provider: 'Vercel',
  },
  {
    model_id: 'google/gemini-3.1-flash-image-preview',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 0.000003,
    provider: 'Vercel',
  },
  {
    model_id: 'google/gemini-3.1-flash-lite-preview',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 0.0000015,
    provider: 'Vercel',
  },
  {
    model_id: 'google/gemini-3.1-pro-preview',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000012,
    provider: 'Vercel',
  },
  {
    model_id: 'inception/mercury-2',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 7.5e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'inception/mercury-coder-small',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 0.000001,
    provider: 'Vercel',
  },
  {
    model_id: 'kwaipilot/kat-coder-pro-v1',
    input_cost_per_token: 3e-8,
    output_cost_per_token: 0.0000012,
    provider: 'Vercel',
  },
  {
    model_id: 'meituan/longcat-flash-thinking',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 0.0000015,
    provider: 'Vercel',
  },
  {
    model_id: 'meta/llama-3.1-70b',
    input_cost_per_token: 7.2e-7,
    output_cost_per_token: 7.2e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'meta/llama-3.1-8b',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 1e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'meta/llama-3.2-11b',
    input_cost_per_token: 1.6e-7,
    output_cost_per_token: 1.6e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'meta/llama-3.2-1b',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 1e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'meta/llama-3.2-3b',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 1.5e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'meta/llama-3.2-90b',
    input_cost_per_token: 7.2e-7,
    output_cost_per_token: 7.2e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'meta/llama-3.3-70b',
    input_cost_per_token: 7.2e-7,
    output_cost_per_token: 7.2e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'meta/llama-4-maverick',
    input_cost_per_token: 2.4e-7,
    output_cost_per_token: 9.7e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'meta/llama-4-scout',
    input_cost_per_token: 1.7e-7,
    output_cost_per_token: 6.6e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'minimax/minimax-m2',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000012,
    provider: 'Vercel',
  },
  {
    model_id: 'minimax/minimax-m2.1',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000012,
    provider: 'Vercel',
  },
  {
    model_id: 'minimax/minimax-m2.1-lightning',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000024,
    provider: 'Vercel',
  },
  {
    model_id: 'minimax/minimax-m2.5',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000012,
    provider: 'Vercel',
  },
  {
    model_id: 'minimax/minimax-m2.5-highspeed',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 0.0000024,
    provider: 'Vercel',
  },
  {
    model_id: 'minimax/minimax-m2.7',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000012,
    provider: 'Vercel',
  },
  {
    model_id: 'minimax/minimax-m2.7-highspeed',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 0.0000024,
    provider: 'Vercel',
  },
  {
    model_id: 'mistral/codestral',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 9e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'mistral/devstral-2',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.000002,
    provider: 'Vercel',
  },
  {
    model_id: 'mistral/devstral-small',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 3e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'mistral/devstral-small-2',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 3e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'mistral/magistral-medium',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000005,
    provider: 'Vercel',
  },
  {
    model_id: 'mistral/magistral-small',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 0.0000015,
    provider: 'Vercel',
  },
  {
    model_id: 'mistral/ministral-14b',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 2e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'mistral/ministral-3b',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 1e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'mistral/ministral-8b',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 1.5e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'mistral/mistral-large-3',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 0.0000015,
    provider: 'Vercel',
  },
  {
    model_id: 'mistral/mistral-medium',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.000002,
    provider: 'Vercel',
  },
  {
    model_id: 'mistral/mistral-nemo',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 1.5e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'mistral/mistral-small',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 3e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'mistral/mixtral-8x22b-instruct',
    input_cost_per_token: 0.0000012,
    output_cost_per_token: 0.0000012,
    provider: 'Vercel',
  },
  {
    model_id: 'mistral/pixtral-12b',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 1.5e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'mistral/pixtral-large',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000006,
    provider: 'Vercel',
  },
  {
    model_id: 'moonshotai/kimi-k2',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 0.0000025,
    provider: 'Vercel',
  },
  {
    model_id: 'moonshotai/kimi-k2-0905',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 0.0000025,
    provider: 'Vercel',
  },
  {
    model_id: 'moonshotai/kimi-k2-thinking',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 0.0000025,
    provider: 'Vercel',
  },
  {
    model_id: 'moonshotai/kimi-k2-thinking-turbo',
    input_cost_per_token: 0.00000115,
    output_cost_per_token: 0.000008,
    provider: 'Vercel',
  },
  {
    model_id: 'moonshotai/kimi-k2-turbo',
    input_cost_per_token: 0.00000115,
    output_cost_per_token: 0.000008,
    provider: 'Vercel',
  },
  {
    model_id: 'moonshotai/kimi-k2.5',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 0.000003,
    provider: 'Vercel',
  },
  {
    model_id: 'morph/morph-v3-fast',
    input_cost_per_token: 8e-7,
    output_cost_per_token: 0.0000012,
    provider: 'Vercel',
  },
  {
    model_id: 'morph/morph-v3-large',
    input_cost_per_token: 9e-7,
    output_cost_per_token: 0.0000019,
    provider: 'Vercel',
  },
  {
    model_id: 'nvidia/nemotron-3-nano-30b-a3b',
    input_cost_per_token: 5e-8,
    output_cost_per_token: 2.4e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'nvidia/nemotron-nano-12b-v2-vl',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 6e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'nvidia/nemotron-nano-9b-v2',
    input_cost_per_token: 6e-8,
    output_cost_per_token: 2.3e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/gpt-3.5-turbo',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 0.0000015,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/gpt-3.5-turbo-instruct',
    input_cost_per_token: 0.0000015,
    output_cost_per_token: 0.000002,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/gpt-4-turbo',
    input_cost_per_token: 0.00001,
    output_cost_per_token: 0.00003,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/gpt-4.1',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000008,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/gpt-4.1-mini',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.0000016,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/gpt-4.1-nano',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 4e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/gpt-4o',
    input_cost_per_token: 0.0000025,
    output_cost_per_token: 0.00001,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/gpt-4o-mini',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 6e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/gpt-4o-mini-search-preview',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 6e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/gpt-5',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/gpt-5-chat',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/gpt-5-codex',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/gpt-5-mini',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 0.000002,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/gpt-5-nano',
    input_cost_per_token: 5e-8,
    output_cost_per_token: 4e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/gpt-5-pro',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.00012,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/gpt-5.1-codex',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/gpt-5.1-codex-max',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/gpt-5.1-codex-mini',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 0.000002,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/gpt-5.1-instant',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/gpt-5.1-thinking',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/gpt-5.2',
    input_cost_per_token: 0.00000175,
    output_cost_per_token: 0.000014,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/gpt-5.2-chat',
    input_cost_per_token: 0.00000175,
    output_cost_per_token: 0.000014,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/gpt-5.2-codex',
    input_cost_per_token: 0.00000175,
    output_cost_per_token: 0.000014,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/gpt-5.2-pro',
    input_cost_per_token: 0.000021,
    output_cost_per_token: 0.000168,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/gpt-5.3-chat',
    input_cost_per_token: 0.00000175,
    output_cost_per_token: 0.000014,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/gpt-5.3-codex',
    input_cost_per_token: 0.00000175,
    output_cost_per_token: 0.000014,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/gpt-5.4',
    input_cost_per_token: 0.0000025,
    output_cost_per_token: 0.000015,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/gpt-5.4-mini',
    input_cost_per_token: 7.5e-7,
    output_cost_per_token: 0.0000045,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/gpt-5.4-nano',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 0.00000125,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/gpt-5.4-pro',
    input_cost_per_token: 0.00003,
    output_cost_per_token: 0.00018,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/gpt-oss-120b',
    input_cost_per_token: 3.5e-7,
    output_cost_per_token: 7.5e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/gpt-oss-20b',
    input_cost_per_token: 7e-8,
    output_cost_per_token: 3e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/gpt-oss-safeguard-20b',
    input_cost_per_token: 7.5e-8,
    output_cost_per_token: 3e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/o1',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.00006,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/o3',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000008,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/o3-deep-research',
    input_cost_per_token: 0.00001,
    output_cost_per_token: 0.00004,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/o3-mini',
    input_cost_per_token: 0.0000011,
    output_cost_per_token: 0.0000044,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/o3-pro',
    input_cost_per_token: 0.00002,
    output_cost_per_token: 0.00008,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/o4-mini',
    input_cost_per_token: 0.0000011,
    output_cost_per_token: 0.0000044,
    provider: 'Vercel',
  },
  {
    model_id: 'perplexity/sonar',
    input_cost_per_token: 0.000001,
    output_cost_per_token: 0.000001,
    provider: 'Vercel',
  },
  {
    model_id: 'perplexity/sonar-pro',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'Vercel',
  },
  {
    model_id: 'perplexity/sonar-reasoning',
    input_cost_per_token: 0.000001,
    output_cost_per_token: 0.000005,
    provider: 'Vercel',
  },
  {
    model_id: 'perplexity/sonar-reasoning-pro',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000008,
    provider: 'Vercel',
  },
  {
    model_id: 'prime-intellect/intellect-3',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 0.0000011,
    provider: 'Vercel',
  },
  {
    model_id: 'xai/grok-2-vision',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.00001,
    provider: 'Vercel',
  },
  {
    model_id: 'xai/grok-3',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'Vercel',
  },
  {
    model_id: 'xai/grok-3-fast',
    input_cost_per_token: 0.000005,
    output_cost_per_token: 0.000025,
    provider: 'Vercel',
  },
  {
    model_id: 'xai/grok-3-mini',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 5e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'xai/grok-3-mini-fast',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 0.000004,
    provider: 'Vercel',
  },
  {
    model_id: 'xai/grok-4',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'Vercel',
  },
  {
    model_id: 'xai/grok-4-fast-non-reasoning',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 5e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'xai/grok-4-fast-reasoning',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 5e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'xai/grok-4.1-fast-non-reasoning',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 5e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'xai/grok-4.1-fast-reasoning',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 5e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'xai/grok-4.20-multi-agent-beta',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000006,
    provider: 'Vercel',
  },
  {
    model_id: 'xai/grok-4.20-non-reasoning-beta',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000006,
    provider: 'Vercel',
  },
  {
    model_id: 'xai/grok-4.20-reasoning-beta',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000006,
    provider: 'Vercel',
  },
  {
    model_id: 'xai/grok-code-fast-1',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 0.0000015,
    provider: 'Vercel',
  },
  {
    model_id: 'xiaomi/mimo-v2-flash',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 3e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'xiaomi/mimo-v2-pro',
    input_cost_per_token: 0.000001,
    output_cost_per_token: 0.000003,
    provider: 'Vercel',
  },
  {
    model_id: 'zai/glm-4.5',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 0.0000022,
    provider: 'Vercel',
  },
  {
    model_id: 'zai/glm-4.5-air',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 0.0000011,
    provider: 'Vercel',
  },
  {
    model_id: 'zai/glm-4.5v',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 0.0000018,
    provider: 'Vercel',
  },
  {
    model_id: 'zai/glm-4.6',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 0.0000022,
    provider: 'Vercel',
  },
  {
    model_id: 'zai/glm-4.6v',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 9e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'zai/glm-4.7',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 0.0000022,
    provider: 'Vercel',
  },
  {
    model_id: 'zai/glm-4.7-flash',
    input_cost_per_token: 7e-8,
    output_cost_per_token: 4e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'zai/glm-4.7-flashx',
    input_cost_per_token: 6e-8,
    output_cost_per_token: 4e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'zai/glm-5',
    input_cost_per_token: 0.000001,
    output_cost_per_token: 0.0000032,
    provider: 'Vercel',
  },
  {
    model_id: 'zai/glm-5-turbo',
    input_cost_per_token: 0.0000012,
    output_cost_per_token: 0.000004,
    provider: 'Vercel',
  },
];
