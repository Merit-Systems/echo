import { SupportedModel } from '../types';

// Union type of all valid Vercel AI Gateway language model IDs.
export type VercelModel =
  | 'vercel-ai-gateway/alibaba/qwen-3-14b'
  | 'vercel-ai-gateway/alibaba/qwen-3-235b'
  | 'vercel-ai-gateway/alibaba/qwen-3-30b'
  | 'vercel-ai-gateway/alibaba/qwen-3-32b'
  | 'vercel-ai-gateway/alibaba/qwen-3.6-max-preview'
  | 'vercel-ai-gateway/alibaba/qwen3-235b-a22b-thinking'
  | 'vercel-ai-gateway/alibaba/qwen3-coder'
  | 'vercel-ai-gateway/alibaba/qwen3-coder-30b-a3b'
  | 'vercel-ai-gateway/alibaba/qwen3-coder-next'
  | 'vercel-ai-gateway/alibaba/qwen3-coder-plus'
  | 'vercel-ai-gateway/alibaba/qwen3-max'
  | 'vercel-ai-gateway/alibaba/qwen3-max-preview'
  | 'vercel-ai-gateway/alibaba/qwen3-max-thinking'
  | 'vercel-ai-gateway/alibaba/qwen3-next-80b-a3b-instruct'
  | 'vercel-ai-gateway/alibaba/qwen3-next-80b-a3b-thinking'
  | 'vercel-ai-gateway/alibaba/qwen3-vl-235b-a22b-instruct'
  | 'vercel-ai-gateway/alibaba/qwen3-vl-instruct'
  | 'vercel-ai-gateway/alibaba/qwen3-vl-thinking'
  | 'vercel-ai-gateway/alibaba/qwen3.5-flash'
  | 'vercel-ai-gateway/alibaba/qwen3.5-plus'
  | 'vercel-ai-gateway/alibaba/qwen3.6-27b'
  | 'vercel-ai-gateway/alibaba/qwen3.6-plus'
  | 'vercel-ai-gateway/amazon/nova-2-lite'
  | 'vercel-ai-gateway/amazon/nova-lite'
  | 'vercel-ai-gateway/amazon/nova-micro'
  | 'vercel-ai-gateway/amazon/nova-pro'
  | 'vercel-ai-gateway/anthropic/claude-3-haiku'
  | 'vercel-ai-gateway/anthropic/claude-3.5-haiku'
  | 'vercel-ai-gateway/anthropic/claude-haiku-4.5'
  | 'vercel-ai-gateway/anthropic/claude-opus-4'
  | 'vercel-ai-gateway/anthropic/claude-opus-4.1'
  | 'vercel-ai-gateway/anthropic/claude-opus-4.5'
  | 'vercel-ai-gateway/anthropic/claude-opus-4.6'
  | 'vercel-ai-gateway/anthropic/claude-opus-4.7'
  | 'vercel-ai-gateway/anthropic/claude-sonnet-4'
  | 'vercel-ai-gateway/anthropic/claude-sonnet-4.5'
  | 'vercel-ai-gateway/anthropic/claude-sonnet-4.6'
  | 'vercel-ai-gateway/arcee-ai/trinity-large-preview'
  | 'vercel-ai-gateway/arcee-ai/trinity-large-thinking'
  | 'vercel-ai-gateway/arcee-ai/trinity-mini'
  | 'vercel-ai-gateway/bytedance/seed-1.6'
  | 'vercel-ai-gateway/bytedance/seed-1.8'
  | 'vercel-ai-gateway/cohere/command-a'
  | 'vercel-ai-gateway/deepseek/deepseek-r1'
  | 'vercel-ai-gateway/deepseek/deepseek-v3'
  | 'vercel-ai-gateway/deepseek/deepseek-v3.1'
  | 'vercel-ai-gateway/deepseek/deepseek-v3.1-terminus'
  | 'vercel-ai-gateway/deepseek/deepseek-v3.2'
  | 'vercel-ai-gateway/deepseek/deepseek-v3.2-thinking'
  | 'vercel-ai-gateway/deepseek/deepseek-v4-flash'
  | 'vercel-ai-gateway/deepseek/deepseek-v4-pro'
  | 'vercel-ai-gateway/google/gemini-2.0-flash'
  | 'vercel-ai-gateway/google/gemini-2.0-flash-lite'
  | 'vercel-ai-gateway/google/gemini-2.5-flash'
  | 'vercel-ai-gateway/google/gemini-2.5-flash-image'
  | 'vercel-ai-gateway/google/gemini-2.5-flash-lite'
  | 'vercel-ai-gateway/google/gemini-2.5-pro'
  | 'vercel-ai-gateway/google/gemini-3-flash'
  | 'vercel-ai-gateway/google/gemini-3-pro-image'
  | 'vercel-ai-gateway/google/gemini-3-pro-preview'
  | 'vercel-ai-gateway/google/gemini-3.1-flash-image-preview'
  | 'vercel-ai-gateway/google/gemini-3.1-flash-lite'
  | 'vercel-ai-gateway/google/gemini-3.1-flash-lite-preview'
  | 'vercel-ai-gateway/google/gemini-3.1-pro-preview'
  | 'vercel-ai-gateway/google/gemma-4-26b-a4b-it'
  | 'vercel-ai-gateway/google/gemma-4-31b-it'
  | 'vercel-ai-gateway/inception/mercury-2'
  | 'vercel-ai-gateway/inception/mercury-coder-small'
  | 'vercel-ai-gateway/interfaze/interfaze-beta'
  | 'vercel-ai-gateway/kwaipilot/kat-coder-pro-v1'
  | 'vercel-ai-gateway/kwaipilot/kat-coder-pro-v2'
  | 'vercel-ai-gateway/meta/llama-3.1-70b'
  | 'vercel-ai-gateway/meta/llama-3.1-8b'
  | 'vercel-ai-gateway/meta/llama-3.2-11b'
  | 'vercel-ai-gateway/meta/llama-3.2-1b'
  | 'vercel-ai-gateway/meta/llama-3.2-3b'
  | 'vercel-ai-gateway/meta/llama-3.2-90b'
  | 'vercel-ai-gateway/meta/llama-3.3-70b'
  | 'vercel-ai-gateway/meta/llama-4-maverick'
  | 'vercel-ai-gateway/meta/llama-4-scout'
  | 'vercel-ai-gateway/minimax/minimax-m2'
  | 'vercel-ai-gateway/minimax/minimax-m2.1'
  | 'vercel-ai-gateway/minimax/minimax-m2.1-lightning'
  | 'vercel-ai-gateway/minimax/minimax-m2.5'
  | 'vercel-ai-gateway/minimax/minimax-m2.5-highspeed'
  | 'vercel-ai-gateway/minimax/minimax-m2.7'
  | 'vercel-ai-gateway/minimax/minimax-m2.7-highspeed'
  | 'vercel-ai-gateway/mistral/codestral'
  | 'vercel-ai-gateway/mistral/devstral-2'
  | 'vercel-ai-gateway/mistral/devstral-small'
  | 'vercel-ai-gateway/mistral/devstral-small-2'
  | 'vercel-ai-gateway/mistral/magistral-medium'
  | 'vercel-ai-gateway/mistral/magistral-small'
  | 'vercel-ai-gateway/mistral/ministral-14b'
  | 'vercel-ai-gateway/mistral/ministral-3b'
  | 'vercel-ai-gateway/mistral/ministral-8b'
  | 'vercel-ai-gateway/mistral/mistral-large-3'
  | 'vercel-ai-gateway/mistral/mistral-medium'
  | 'vercel-ai-gateway/mistral/mistral-nemo'
  | 'vercel-ai-gateway/mistral/mistral-small'
  | 'vercel-ai-gateway/mistral/pixtral-12b'
  | 'vercel-ai-gateway/mistral/pixtral-large'
  | 'vercel-ai-gateway/moonshotai/kimi-k2'
  | 'vercel-ai-gateway/moonshotai/kimi-k2-thinking'
  | 'vercel-ai-gateway/moonshotai/kimi-k2-thinking-turbo'
  | 'vercel-ai-gateway/moonshotai/kimi-k2-turbo'
  | 'vercel-ai-gateway/moonshotai/kimi-k2.5'
  | 'vercel-ai-gateway/moonshotai/kimi-k2.6'
  | 'vercel-ai-gateway/morph/morph-v3-fast'
  | 'vercel-ai-gateway/morph/morph-v3-large'
  | 'vercel-ai-gateway/nvidia/nemotron-3-nano-30b-a3b'
  | 'vercel-ai-gateway/nvidia/nemotron-3-super-120b-a12b'
  | 'vercel-ai-gateway/nvidia/nemotron-nano-12b-v2-vl'
  | 'vercel-ai-gateway/nvidia/nemotron-nano-9b-v2'
  | 'vercel-ai-gateway/openai/gpt-3.5-turbo'
  | 'vercel-ai-gateway/openai/gpt-3.5-turbo-instruct'
  | 'vercel-ai-gateway/openai/gpt-4-turbo'
  | 'vercel-ai-gateway/openai/gpt-4.1'
  | 'vercel-ai-gateway/openai/gpt-4.1-mini'
  | 'vercel-ai-gateway/openai/gpt-4.1-nano'
  | 'vercel-ai-gateway/openai/gpt-4o'
  | 'vercel-ai-gateway/openai/gpt-4o-mini'
  | 'vercel-ai-gateway/openai/gpt-4o-mini-search-preview'
  | 'vercel-ai-gateway/openai/gpt-5'
  | 'vercel-ai-gateway/openai/gpt-5-chat'
  | 'vercel-ai-gateway/openai/gpt-5-codex'
  | 'vercel-ai-gateway/openai/gpt-5-mini'
  | 'vercel-ai-gateway/openai/gpt-5-nano'
  | 'vercel-ai-gateway/openai/gpt-5-pro'
  | 'vercel-ai-gateway/openai/gpt-5.1-codex'
  | 'vercel-ai-gateway/openai/gpt-5.1-codex-max'
  | 'vercel-ai-gateway/openai/gpt-5.1-codex-mini'
  | 'vercel-ai-gateway/openai/gpt-5.1-instant'
  | 'vercel-ai-gateway/openai/gpt-5.1-thinking'
  | 'vercel-ai-gateway/openai/gpt-5.2'
  | 'vercel-ai-gateway/openai/gpt-5.2-chat'
  | 'vercel-ai-gateway/openai/gpt-5.2-codex'
  | 'vercel-ai-gateway/openai/gpt-5.2-pro'
  | 'vercel-ai-gateway/openai/gpt-5.3-chat'
  | 'vercel-ai-gateway/openai/gpt-5.3-codex'
  | 'vercel-ai-gateway/openai/gpt-5.4'
  | 'vercel-ai-gateway/openai/gpt-5.4-mini'
  | 'vercel-ai-gateway/openai/gpt-5.4-nano'
  | 'vercel-ai-gateway/openai/gpt-5.4-pro'
  | 'vercel-ai-gateway/openai/gpt-5.5'
  | 'vercel-ai-gateway/openai/gpt-5.5-pro'
  | 'vercel-ai-gateway/openai/gpt-oss-120b'
  | 'vercel-ai-gateway/openai/gpt-oss-20b'
  | 'vercel-ai-gateway/openai/gpt-oss-safeguard-20b'
  | 'vercel-ai-gateway/openai/o1'
  | 'vercel-ai-gateway/openai/o3'
  | 'vercel-ai-gateway/openai/o3-deep-research'
  | 'vercel-ai-gateway/openai/o3-mini'
  | 'vercel-ai-gateway/openai/o3-pro'
  | 'vercel-ai-gateway/openai/o4-mini'
  | 'vercel-ai-gateway/xai/grok-3'
  | 'vercel-ai-gateway/xai/grok-3-fast'
  | 'vercel-ai-gateway/xai/grok-3-mini'
  | 'vercel-ai-gateway/xai/grok-3-mini-fast'
  | 'vercel-ai-gateway/xai/grok-4'
  | 'vercel-ai-gateway/xai/grok-4-fast-non-reasoning'
  | 'vercel-ai-gateway/xai/grok-4-fast-reasoning'
  | 'vercel-ai-gateway/xai/grok-4.1-fast-non-reasoning'
  | 'vercel-ai-gateway/xai/grok-4.1-fast-reasoning'
  | 'vercel-ai-gateway/xai/grok-4.20-multi-agent'
  | 'vercel-ai-gateway/xai/grok-4.20-multi-agent-beta'
  | 'vercel-ai-gateway/xai/grok-4.20-non-reasoning'
  | 'vercel-ai-gateway/xai/grok-4.20-non-reasoning-beta'
  | 'vercel-ai-gateway/xai/grok-4.20-reasoning'
  | 'vercel-ai-gateway/xai/grok-4.20-reasoning-beta'
  | 'vercel-ai-gateway/xai/grok-4.3'
  | 'vercel-ai-gateway/xai/grok-code-fast-1'
  | 'vercel-ai-gateway/xiaomi/mimo-v2-flash'
  | 'vercel-ai-gateway/xiaomi/mimo-v2-pro'
  | 'vercel-ai-gateway/xiaomi/mimo-v2.5'
  | 'vercel-ai-gateway/xiaomi/mimo-v2.5-pro'
  | 'vercel-ai-gateway/zai/glm-4.5'
  | 'vercel-ai-gateway/zai/glm-4.5-air'
  | 'vercel-ai-gateway/zai/glm-4.5v'
  | 'vercel-ai-gateway/zai/glm-4.6'
  | 'vercel-ai-gateway/zai/glm-4.6v'
  | 'vercel-ai-gateway/zai/glm-4.7'
  | 'vercel-ai-gateway/zai/glm-4.7-flash'
  | 'vercel-ai-gateway/zai/glm-4.7-flashx'
  | 'vercel-ai-gateway/zai/glm-5'
  | 'vercel-ai-gateway/zai/glm-5-turbo'
  | 'vercel-ai-gateway/zai/glm-5.1'
  | 'vercel-ai-gateway/zai/glm-5v-turbo';

export const VercelModels: SupportedModel[] = [
  {
    model_id: 'vercel-ai-gateway/alibaba/qwen-3-14b',
    input_cost_per_token: 1.2e-7,
    output_cost_per_token: 2.4e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/alibaba/qwen-3-235b',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 0.0000012,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/alibaba/qwen-3-30b',
    input_cost_per_token: 8e-8,
    output_cost_per_token: 2.9e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/alibaba/qwen-3-32b',
    input_cost_per_token: 1.6e-7,
    output_cost_per_token: 6.4e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/alibaba/qwen-3.6-max-preview',
    input_cost_per_token: 0.0000013,
    output_cost_per_token: 0.0000078,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/alibaba/qwen3-235b-a22b-thinking',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.000004,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/alibaba/qwen3-coder',
    input_cost_per_token: 0.0000015,
    output_cost_per_token: 0.0000075,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/alibaba/qwen3-coder-30b-a3b',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 6e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/alibaba/qwen3-coder-next',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 0.0000012,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/alibaba/qwen3-coder-plus',
    input_cost_per_token: 0.000001,
    output_cost_per_token: 0.000005,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/alibaba/qwen3-max',
    input_cost_per_token: 0.0000012,
    output_cost_per_token: 0.000006,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/alibaba/qwen3-max-preview',
    input_cost_per_token: 0.0000012,
    output_cost_per_token: 0.000006,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/alibaba/qwen3-max-thinking',
    input_cost_per_token: 0.0000012,
    output_cost_per_token: 0.000006,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/alibaba/qwen3-next-80b-a3b-instruct',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 0.0000012,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/alibaba/qwen3-next-80b-a3b-thinking',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 0.0000012,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/alibaba/qwen3-vl-235b-a22b-instruct',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.0000016,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/alibaba/qwen3-vl-instruct',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.0000016,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/alibaba/qwen3-vl-thinking',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.000004,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/alibaba/qwen3.5-flash',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 4e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/alibaba/qwen3.5-plus',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.0000024,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/alibaba/qwen3.6-27b',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 0.0000036,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/alibaba/qwen3.6-plus',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 0.000003,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/amazon/nova-2-lite',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000025,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/amazon/nova-lite',
    input_cost_per_token: 6e-8,
    output_cost_per_token: 2.4e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/amazon/nova-micro',
    input_cost_per_token: 3.5e-8,
    output_cost_per_token: 1.4e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/amazon/nova-pro',
    input_cost_per_token: 8e-7,
    output_cost_per_token: 0.0000032,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/anthropic/claude-3-haiku',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 0.00000125,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/anthropic/claude-3.5-haiku',
    input_cost_per_token: 8e-7,
    output_cost_per_token: 0.000004,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/anthropic/claude-haiku-4.5',
    input_cost_per_token: 0.000001,
    output_cost_per_token: 0.000005,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/anthropic/claude-opus-4',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.000075,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/anthropic/claude-opus-4.1',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.000075,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/anthropic/claude-opus-4.5',
    input_cost_per_token: 0.000005,
    output_cost_per_token: 0.000025,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/anthropic/claude-opus-4.6',
    input_cost_per_token: 0.000005,
    output_cost_per_token: 0.000025,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/anthropic/claude-opus-4.7',
    input_cost_per_token: 0.000005,
    output_cost_per_token: 0.000025,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/anthropic/claude-sonnet-4',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/anthropic/claude-sonnet-4.5',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/anthropic/claude-sonnet-4.6',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/arcee-ai/trinity-large-preview',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 0.000001,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/arcee-ai/trinity-large-thinking',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 9e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/arcee-ai/trinity-mini',
    input_cost_per_token: 4.5e-8,
    output_cost_per_token: 1.5e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/bytedance/seed-1.6',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 0.000002,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/bytedance/seed-1.8',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 0.000002,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/cohere/command-a',
    input_cost_per_token: 0.0000025,
    output_cost_per_token: 0.00001,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/deepseek/deepseek-r1',
    input_cost_per_token: 0.00000135,
    output_cost_per_token: 0.0000054,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/deepseek/deepseek-v3',
    input_cost_per_token: 7.7e-7,
    output_cost_per_token: 7.7e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/deepseek/deepseek-v3.1',
    input_cost_per_token: 5.6e-7,
    output_cost_per_token: 0.00000168,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/deepseek/deepseek-v3.1-terminus',
    input_cost_per_token: 2.7e-7,
    output_cost_per_token: 0.000001,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/deepseek/deepseek-v3.2',
    input_cost_per_token: 2.8e-7,
    output_cost_per_token: 4.2e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/deepseek/deepseek-v3.2-thinking',
    input_cost_per_token: 6.2e-7,
    output_cost_per_token: 0.00000185,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/deepseek/deepseek-v4-flash',
    input_cost_per_token: 1.4e-7,
    output_cost_per_token: 2.8e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/deepseek/deepseek-v4-pro',
    input_cost_per_token: 4.35e-7,
    output_cost_per_token: 8.7e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/google/gemini-2.0-flash',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 6e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/google/gemini-2.0-flash-lite',
    input_cost_per_token: 7.5e-8,
    output_cost_per_token: 3e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/google/gemini-2.5-flash',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000025,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/google/gemini-2.5-flash-image',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000025,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/google/gemini-2.5-flash-lite',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 4e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/google/gemini-2.5-pro',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/google/gemini-3-flash',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 0.000003,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/google/gemini-3-pro-image',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000012,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/google/gemini-3-pro-preview',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000012,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/google/gemini-3.1-flash-image-preview',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 0.000003,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/google/gemini-3.1-flash-lite',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 0.0000015,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/google/gemini-3.1-flash-lite-preview',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 0.0000015,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/google/gemini-3.1-pro-preview',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000012,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/google/gemma-4-26b-a4b-it',
    input_cost_per_token: 1.3e-7,
    output_cost_per_token: 4e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/google/gemma-4-31b-it',
    input_cost_per_token: 1.4e-7,
    output_cost_per_token: 4e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/inception/mercury-2',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 7.5e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/inception/mercury-coder-small',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 0.000001,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/interfaze/interfaze-beta',
    input_cost_per_token: 0.0000015,
    output_cost_per_token: 0.0000035,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/kwaipilot/kat-coder-pro-v1',
    input_cost_per_token: 3e-8,
    output_cost_per_token: 0.0000012,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/kwaipilot/kat-coder-pro-v2',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000012,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/meta/llama-3.1-70b',
    input_cost_per_token: 7.2e-7,
    output_cost_per_token: 7.2e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/meta/llama-3.1-8b',
    input_cost_per_token: 2.2e-7,
    output_cost_per_token: 2.2e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/meta/llama-3.2-11b',
    input_cost_per_token: 1.6e-7,
    output_cost_per_token: 1.6e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/meta/llama-3.2-1b',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 1e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/meta/llama-3.2-3b',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 1.5e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/meta/llama-3.2-90b',
    input_cost_per_token: 7.2e-7,
    output_cost_per_token: 7.2e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/meta/llama-3.3-70b',
    input_cost_per_token: 7.2e-7,
    output_cost_per_token: 7.2e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/meta/llama-4-maverick',
    input_cost_per_token: 2.4e-7,
    output_cost_per_token: 9.7e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/meta/llama-4-scout',
    input_cost_per_token: 1.7e-7,
    output_cost_per_token: 6.6e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/minimax/minimax-m2',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000012,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/minimax/minimax-m2.1',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000012,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/minimax/minimax-m2.1-lightning',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000024,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/minimax/minimax-m2.5',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000012,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/minimax/minimax-m2.5-highspeed',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 0.0000024,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/minimax/minimax-m2.7',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000012,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/minimax/minimax-m2.7-highspeed',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 0.0000024,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/mistral/codestral',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 9e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/mistral/devstral-2',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.000002,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/mistral/devstral-small',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 3e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/mistral/devstral-small-2',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 3e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/mistral/magistral-medium',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000005,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/mistral/magistral-small',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 0.0000015,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/mistral/ministral-14b',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 2e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/mistral/ministral-3b',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 1e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/mistral/ministral-8b',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 1.5e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/mistral/mistral-large-3',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 0.0000015,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/mistral/mistral-medium',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.000002,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/mistral/mistral-nemo',
    input_cost_per_token: 2e-8,
    output_cost_per_token: 4e-8,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/mistral/mistral-small',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 3e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/mistral/pixtral-12b',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 1.5e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/mistral/pixtral-large',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000006,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/moonshotai/kimi-k2',
    input_cost_per_token: 5.7e-7,
    output_cost_per_token: 0.0000023,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/moonshotai/kimi-k2-thinking',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 0.0000025,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/moonshotai/kimi-k2-thinking-turbo',
    input_cost_per_token: 0.00000115,
    output_cost_per_token: 0.000008,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/moonshotai/kimi-k2-turbo',
    input_cost_per_token: 0.00000115,
    output_cost_per_token: 0.000008,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/moonshotai/kimi-k2.5',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 0.000003,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/moonshotai/kimi-k2.6',
    input_cost_per_token: 9.5e-7,
    output_cost_per_token: 0.000004,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/morph/morph-v3-fast',
    input_cost_per_token: 8e-7,
    output_cost_per_token: 0.0000012,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/morph/morph-v3-large',
    input_cost_per_token: 9e-7,
    output_cost_per_token: 0.0000019,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/nvidia/nemotron-3-nano-30b-a3b',
    input_cost_per_token: 5e-8,
    output_cost_per_token: 2.4e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/nvidia/nemotron-3-super-120b-a12b',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 6.5e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/nvidia/nemotron-nano-12b-v2-vl',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 6e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/nvidia/nemotron-nano-9b-v2',
    input_cost_per_token: 6e-8,
    output_cost_per_token: 2.3e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/gpt-3.5-turbo',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 0.0000015,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/gpt-3.5-turbo-instruct',
    input_cost_per_token: 0.0000015,
    output_cost_per_token: 0.000002,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/gpt-4-turbo',
    input_cost_per_token: 0.00001,
    output_cost_per_token: 0.00003,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/gpt-4.1',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000008,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/gpt-4.1-mini',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.0000016,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/gpt-4.1-nano',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 4e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/gpt-4o',
    input_cost_per_token: 0.0000025,
    output_cost_per_token: 0.00001,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/gpt-4o-mini',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 6e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/gpt-4o-mini-search-preview',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 6e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/gpt-5',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/gpt-5-chat',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/gpt-5-codex',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/gpt-5-mini',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 0.000002,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/gpt-5-nano',
    input_cost_per_token: 5e-8,
    output_cost_per_token: 4e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/gpt-5-pro',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.00012,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/gpt-5.1-codex',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/gpt-5.1-codex-max',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/gpt-5.1-codex-mini',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 0.000002,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/gpt-5.1-instant',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/gpt-5.1-thinking',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/gpt-5.2',
    input_cost_per_token: 0.00000175,
    output_cost_per_token: 0.000014,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/gpt-5.2-chat',
    input_cost_per_token: 0.00000175,
    output_cost_per_token: 0.000014,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/gpt-5.2-codex',
    input_cost_per_token: 0.00000175,
    output_cost_per_token: 0.000014,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/gpt-5.2-pro',
    input_cost_per_token: 0.000021,
    output_cost_per_token: 0.000168,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/gpt-5.3-chat',
    input_cost_per_token: 0.00000175,
    output_cost_per_token: 0.000014,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/gpt-5.3-codex',
    input_cost_per_token: 0.00000175,
    output_cost_per_token: 0.000014,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/gpt-5.4',
    input_cost_per_token: 0.0000025,
    output_cost_per_token: 0.000015,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/gpt-5.4-mini',
    input_cost_per_token: 7.5e-7,
    output_cost_per_token: 0.0000045,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/gpt-5.4-nano',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 0.00000125,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/gpt-5.4-pro',
    input_cost_per_token: 0.00003,
    output_cost_per_token: 0.00018,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/gpt-5.5',
    input_cost_per_token: 0.000005,
    output_cost_per_token: 0.00003,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/gpt-5.5-pro',
    input_cost_per_token: 0.00003,
    output_cost_per_token: 0.00018,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/gpt-oss-120b',
    input_cost_per_token: 3.5e-7,
    output_cost_per_token: 7.5e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/gpt-oss-20b',
    input_cost_per_token: 5e-8,
    output_cost_per_token: 2e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/gpt-oss-safeguard-20b',
    input_cost_per_token: 7.5e-8,
    output_cost_per_token: 3e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/o1',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.00006,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/o3',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000008,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/o3-deep-research',
    input_cost_per_token: 0.00001,
    output_cost_per_token: 0.00004,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/o3-mini',
    input_cost_per_token: 0.0000011,
    output_cost_per_token: 0.0000044,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/o3-pro',
    input_cost_per_token: 0.00002,
    output_cost_per_token: 0.00008,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/openai/o4-mini',
    input_cost_per_token: 0.0000011,
    output_cost_per_token: 0.0000044,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/xai/grok-3',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/xai/grok-3-fast',
    input_cost_per_token: 0.000005,
    output_cost_per_token: 0.000025,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/xai/grok-3-mini',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 5e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/xai/grok-3-mini-fast',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 0.000004,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/xai/grok-4',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/xai/grok-4-fast-non-reasoning',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 5e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/xai/grok-4-fast-reasoning',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 5e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/xai/grok-4.1-fast-non-reasoning',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 5e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/xai/grok-4.1-fast-reasoning',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 5e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/xai/grok-4.20-multi-agent',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.0000025,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/xai/grok-4.20-multi-agent-beta',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.0000025,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/xai/grok-4.20-non-reasoning',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.0000025,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/xai/grok-4.20-non-reasoning-beta',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.0000025,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/xai/grok-4.20-reasoning',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.0000025,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/xai/grok-4.20-reasoning-beta',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.0000025,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/xai/grok-4.3',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.0000025,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/xai/grok-code-fast-1',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 0.0000015,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/xiaomi/mimo-v2-flash',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 3e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/xiaomi/mimo-v2-pro',
    input_cost_per_token: 0.000001,
    output_cost_per_token: 0.000003,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/xiaomi/mimo-v2.5',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.000002,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/xiaomi/mimo-v2.5-pro',
    input_cost_per_token: 0.000001,
    output_cost_per_token: 0.000003,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/zai/glm-4.5',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 0.0000022,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/zai/glm-4.5-air',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 0.0000011,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/zai/glm-4.5v',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 0.0000018,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/zai/glm-4.6',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 0.0000022,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/zai/glm-4.6v',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 9e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/zai/glm-4.7',
    input_cost_per_token: 0.00000225,
    output_cost_per_token: 0.00000275,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/zai/glm-4.7-flash',
    input_cost_per_token: 7e-8,
    output_cost_per_token: 4e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/zai/glm-4.7-flashx',
    input_cost_per_token: 6e-8,
    output_cost_per_token: 4e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/zai/glm-5',
    input_cost_per_token: 0.000001,
    output_cost_per_token: 0.0000032,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/zai/glm-5-turbo',
    input_cost_per_token: 0.0000012,
    output_cost_per_token: 0.000004,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/zai/glm-5.1',
    input_cost_per_token: 0.0000014,
    output_cost_per_token: 0.0000044,
    provider: 'Vercel',
  },
  {
    model_id: 'vercel-ai-gateway/zai/glm-5v-turbo',
    input_cost_per_token: 0.0000012,
    output_cost_per_token: 0.000004,
    provider: 'Vercel',
  },
];
