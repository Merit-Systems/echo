import { SupportedModel } from '../types';

// Union type of all Echo model IDs routed through Vercel AI Gateway.
// Strip the leading "vercel/" before forwarding to Vercel.
export type VercelAIGatewayModel =
  | 'vercel/alibaba/qwen-3-14b'
  | 'vercel/alibaba/qwen-3-235b'
  | 'vercel/alibaba/qwen-3-30b'
  | 'vercel/alibaba/qwen-3-32b'
  | 'vercel/alibaba/qwen-3.6-max-preview'
  | 'vercel/alibaba/qwen3-235b-a22b-thinking'
  | 'vercel/alibaba/qwen3-coder'
  | 'vercel/alibaba/qwen3-coder-30b-a3b'
  | 'vercel/alibaba/qwen3-coder-next'
  | 'vercel/alibaba/qwen3-coder-plus'
  | 'vercel/alibaba/qwen3-max'
  | 'vercel/alibaba/qwen3-max-preview'
  | 'vercel/alibaba/qwen3-max-thinking'
  | 'vercel/alibaba/qwen3-next-80b-a3b-instruct'
  | 'vercel/alibaba/qwen3-next-80b-a3b-thinking'
  | 'vercel/alibaba/qwen3-vl-instruct'
  | 'vercel/alibaba/qwen3-vl-thinking'
  | 'vercel/alibaba/qwen3.5-flash'
  | 'vercel/alibaba/qwen3.5-plus'
  | 'vercel/alibaba/qwen3.6-plus'
  | 'vercel/amazon/nova-2-lite'
  | 'vercel/amazon/nova-lite'
  | 'vercel/amazon/nova-micro'
  | 'vercel/amazon/nova-pro'
  | 'vercel/anthropic/claude-3-haiku'
  | 'vercel/anthropic/claude-3.5-haiku'
  | 'vercel/anthropic/claude-3.7-sonnet'
  | 'vercel/anthropic/claude-haiku-4.5'
  | 'vercel/anthropic/claude-opus-4'
  | 'vercel/anthropic/claude-opus-4.1'
  | 'vercel/anthropic/claude-opus-4.5'
  | 'vercel/anthropic/claude-opus-4.6'
  | 'vercel/anthropic/claude-opus-4.7'
  | 'vercel/anthropic/claude-sonnet-4'
  | 'vercel/anthropic/claude-sonnet-4.5'
  | 'vercel/anthropic/claude-sonnet-4.6'
  | 'vercel/arcee-ai/trinity-large-preview'
  | 'vercel/arcee-ai/trinity-large-thinking'
  | 'vercel/arcee-ai/trinity-mini'
  | 'vercel/bytedance/seed-1.6'
  | 'vercel/bytedance/seed-1.8'
  | 'vercel/cohere/command-a'
  | 'vercel/deepseek/deepseek-r1'
  | 'vercel/deepseek/deepseek-v3'
  | 'vercel/deepseek/deepseek-v3.1'
  | 'vercel/deepseek/deepseek-v3.1-terminus'
  | 'vercel/deepseek/deepseek-v3.2'
  | 'vercel/deepseek/deepseek-v3.2-thinking'
  | 'vercel/deepseek/deepseek-v4-flash'
  | 'vercel/deepseek/deepseek-v4-pro'
  | 'vercel/google/gemini-2.0-flash'
  | 'vercel/google/gemini-2.0-flash-lite'
  | 'vercel/google/gemini-2.5-flash'
  | 'vercel/google/gemini-2.5-flash-image'
  | 'vercel/google/gemini-2.5-flash-lite'
  | 'vercel/google/gemini-2.5-pro'
  | 'vercel/google/gemini-3-flash'
  | 'vercel/google/gemini-3-pro-image'
  | 'vercel/google/gemini-3-pro-preview'
  | 'vercel/google/gemini-3.1-flash-image-preview'
  | 'vercel/google/gemini-3.1-flash-lite-preview'
  | 'vercel/google/gemini-3.1-pro-preview'
  | 'vercel/google/gemma-4-26b-a4b-it'
  | 'vercel/google/gemma-4-31b-it'
  | 'vercel/inception/mercury-2'
  | 'vercel/inception/mercury-coder-small'
  | 'vercel/kwaipilot/kat-coder-pro-v1'
  | 'vercel/kwaipilot/kat-coder-pro-v2'
  | 'vercel/meta/llama-3.1-70b'
  | 'vercel/meta/llama-3.1-8b'
  | 'vercel/meta/llama-3.2-11b'
  | 'vercel/meta/llama-3.2-1b'
  | 'vercel/meta/llama-3.2-3b'
  | 'vercel/meta/llama-3.2-90b'
  | 'vercel/meta/llama-3.3-70b'
  | 'vercel/meta/llama-4-maverick'
  | 'vercel/meta/llama-4-scout'
  | 'vercel/minimax/minimax-m2'
  | 'vercel/minimax/minimax-m2.1'
  | 'vercel/minimax/minimax-m2.1-lightning'
  | 'vercel/minimax/minimax-m2.5'
  | 'vercel/minimax/minimax-m2.5-highspeed'
  | 'vercel/minimax/minimax-m2.7'
  | 'vercel/minimax/minimax-m2.7-highspeed'
  | 'vercel/mistral/codestral'
  | 'vercel/mistral/devstral-2'
  | 'vercel/mistral/devstral-small'
  | 'vercel/mistral/devstral-small-2'
  | 'vercel/mistral/magistral-medium'
  | 'vercel/mistral/magistral-small'
  | 'vercel/mistral/ministral-14b'
  | 'vercel/mistral/ministral-3b'
  | 'vercel/mistral/ministral-8b'
  | 'vercel/mistral/mistral-large-3'
  | 'vercel/mistral/mistral-medium'
  | 'vercel/mistral/mistral-nemo'
  | 'vercel/mistral/mistral-small'
  | 'vercel/mistral/mixtral-8x22b-instruct'
  | 'vercel/mistral/pixtral-12b'
  | 'vercel/mistral/pixtral-large'
  | 'vercel/moonshotai/kimi-k2'
  | 'vercel/moonshotai/kimi-k2-0905'
  | 'vercel/moonshotai/kimi-k2-thinking'
  | 'vercel/moonshotai/kimi-k2-thinking-turbo'
  | 'vercel/moonshotai/kimi-k2-turbo'
  | 'vercel/moonshotai/kimi-k2.5'
  | 'vercel/moonshotai/kimi-k2.6'
  | 'vercel/morph/morph-v3-fast'
  | 'vercel/morph/morph-v3-large'
  | 'vercel/nvidia/nemotron-3-nano-30b-a3b'
  | 'vercel/nvidia/nemotron-3-super-120b-a12b'
  | 'vercel/nvidia/nemotron-nano-12b-v2-vl'
  | 'vercel/nvidia/nemotron-nano-9b-v2'
  | 'vercel/openai/gpt-3.5-turbo'
  | 'vercel/openai/gpt-3.5-turbo-instruct'
  | 'vercel/openai/gpt-4-turbo'
  | 'vercel/openai/gpt-4.1'
  | 'vercel/openai/gpt-4.1-mini'
  | 'vercel/openai/gpt-4.1-nano'
  | 'vercel/openai/gpt-4o'
  | 'vercel/openai/gpt-4o-mini'
  | 'vercel/openai/gpt-4o-mini-search-preview'
  | 'vercel/openai/gpt-5'
  | 'vercel/openai/gpt-5-chat'
  | 'vercel/openai/gpt-5-codex'
  | 'vercel/openai/gpt-5-mini'
  | 'vercel/openai/gpt-5-nano'
  | 'vercel/openai/gpt-5-pro'
  | 'vercel/openai/gpt-5.1-codex'
  | 'vercel/openai/gpt-5.1-codex-max'
  | 'vercel/openai/gpt-5.1-codex-mini'
  | 'vercel/openai/gpt-5.1-instant'
  | 'vercel/openai/gpt-5.1-thinking'
  | 'vercel/openai/gpt-5.2'
  | 'vercel/openai/gpt-5.2-chat'
  | 'vercel/openai/gpt-5.2-codex'
  | 'vercel/openai/gpt-5.2-pro'
  | 'vercel/openai/gpt-5.3-chat'
  | 'vercel/openai/gpt-5.3-codex'
  | 'vercel/openai/gpt-5.4'
  | 'vercel/openai/gpt-5.4-mini'
  | 'vercel/openai/gpt-5.4-nano'
  | 'vercel/openai/gpt-5.4-pro'
  | 'vercel/openai/gpt-5.5'
  | 'vercel/openai/gpt-5.5-pro'
  | 'vercel/openai/gpt-oss-120b'
  | 'vercel/openai/gpt-oss-20b'
  | 'vercel/openai/gpt-oss-safeguard-20b'
  | 'vercel/openai/o1'
  | 'vercel/openai/o3'
  | 'vercel/openai/o3-deep-research'
  | 'vercel/openai/o3-mini'
  | 'vercel/openai/o3-pro'
  | 'vercel/openai/o4-mini'
  | 'vercel/prime-intellect/intellect-3'
  | 'vercel/xai/grok-3'
  | 'vercel/xai/grok-3-fast'
  | 'vercel/xai/grok-3-mini'
  | 'vercel/xai/grok-3-mini-fast'
  | 'vercel/xai/grok-4'
  | 'vercel/xai/grok-4-fast-non-reasoning'
  | 'vercel/xai/grok-4-fast-reasoning'
  | 'vercel/xai/grok-4.1-fast-non-reasoning'
  | 'vercel/xai/grok-4.1-fast-reasoning'
  | 'vercel/xai/grok-4.20-multi-agent'
  | 'vercel/xai/grok-4.20-multi-agent-beta'
  | 'vercel/xai/grok-4.20-non-reasoning'
  | 'vercel/xai/grok-4.20-non-reasoning-beta'
  | 'vercel/xai/grok-4.20-reasoning'
  | 'vercel/xai/grok-4.20-reasoning-beta'
  | 'vercel/xai/grok-code-fast-1'
  | 'vercel/xiaomi/mimo-v2-flash'
  | 'vercel/xiaomi/mimo-v2-pro'
  | 'vercel/zai/glm-4.5'
  | 'vercel/zai/glm-4.5-air'
  | 'vercel/zai/glm-4.5v'
  | 'vercel/zai/glm-4.6'
  | 'vercel/zai/glm-4.6v'
  | 'vercel/zai/glm-4.7'
  | 'vercel/zai/glm-4.7-flash'
  | 'vercel/zai/glm-4.7-flashx'
  | 'vercel/zai/glm-5'
  | 'vercel/zai/glm-5-turbo'
  | 'vercel/zai/glm-5.1'
  | 'vercel/zai/glm-5v-turbo';

export const VercelAIGatewayModels: SupportedModel[] = [
  {
    model_id: 'vercel/alibaba/qwen-3-14b',
    input_cost_per_token: 1.2e-7,
    output_cost_per_token: 2.4e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/alibaba/qwen-3-235b',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 0.0000012,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/alibaba/qwen-3-30b',
    input_cost_per_token: 8e-8,
    output_cost_per_token: 2.9e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/alibaba/qwen-3-32b',
    input_cost_per_token: 1.6e-7,
    output_cost_per_token: 6.4e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/alibaba/qwen-3.6-max-preview',
    input_cost_per_token: 0.0000013,
    output_cost_per_token: 0.0000078,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/alibaba/qwen3-235b-a22b-thinking',
    input_cost_per_token: 2.3e-7,
    output_cost_per_token: 0.0000023,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/alibaba/qwen3-coder',
    input_cost_per_token: 0.0000015,
    output_cost_per_token: 0.0000075,
    input_cost_per_token_tiers: [
      { cost: 0.0000015, min: 0, max: 32001 },
      { cost: 0.0000027, min: 32001, max: 128001 },
      { cost: 0.0000045, min: 128001 },
    ],
    output_cost_per_token_tiers: [
      { cost: 0.0000075, min: 0, max: 32001 },
      { cost: 0.0000135, min: 32001, max: 128001 },
      { cost: 0.0000225, min: 128001 },
    ],
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/alibaba/qwen3-coder-30b-a3b',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 6e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/alibaba/qwen3-coder-next',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 0.0000012,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/alibaba/qwen3-coder-plus',
    input_cost_per_token: 0.000001,
    output_cost_per_token: 0.000005,
    input_cost_per_token_tiers: [
      { cost: 0.000001, min: 0, max: 32001 },
      { cost: 0.0000018, min: 32001, max: 128001 },
      { cost: 0.000003, min: 128001, max: 256001 },
      { cost: 0.000006, min: 256001 },
    ],
    output_cost_per_token_tiers: [
      { cost: 0.000005, min: 0, max: 32001 },
      { cost: 0.000009, min: 32001, max: 128001 },
      { cost: 0.000015, min: 128001, max: 256001 },
      { cost: 0.00006, min: 256001 },
    ],
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/alibaba/qwen3-max',
    input_cost_per_token: 0.0000012,
    output_cost_per_token: 0.000006,
    input_cost_per_token_tiers: [
      { cost: 0.0000012, min: 0, max: 32001 },
      { cost: 0.0000024, min: 32001, max: 128001 },
      { cost: 0.000003, min: 128001 },
    ],
    output_cost_per_token_tiers: [
      { cost: 0.000006, min: 0, max: 32001 },
      { cost: 0.000012, min: 32001, max: 128001 },
      { cost: 0.000015, min: 128001 },
    ],
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/alibaba/qwen3-max-preview',
    input_cost_per_token: 0.0000012,
    output_cost_per_token: 0.000006,
    input_cost_per_token_tiers: [
      { cost: 0.0000012, min: 0, max: 32001 },
      { cost: 0.0000024, min: 32001, max: 128001 },
      { cost: 0.000003, min: 128001 },
    ],
    output_cost_per_token_tiers: [
      { cost: 0.000006, min: 0, max: 32001 },
      { cost: 0.000012, min: 32001, max: 128001 },
      { cost: 0.000015, min: 128001 },
    ],
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/alibaba/qwen3-max-thinking',
    input_cost_per_token: 0.0000012,
    output_cost_per_token: 0.000006,
    input_cost_per_token_tiers: [
      { cost: 0.0000012, min: 0, max: 32001 },
      { cost: 0.0000024, min: 32001, max: 128001 },
      { cost: 0.000003, min: 128001 },
    ],
    output_cost_per_token_tiers: [
      { cost: 0.000006, min: 0, max: 32001 },
      { cost: 0.000012, min: 32001, max: 128001 },
      { cost: 0.000015, min: 128001 },
    ],
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/alibaba/qwen3-next-80b-a3b-instruct',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 0.0000012,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/alibaba/qwen3-next-80b-a3b-thinking',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 0.0000012,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/alibaba/qwen3-vl-instruct',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.0000016,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/alibaba/qwen3-vl-thinking',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.000004,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/alibaba/qwen3.5-flash',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 4e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/alibaba/qwen3.5-plus',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.0000024,
    input_cost_per_token_tiers: [
      { cost: 4e-7, min: 0, max: 256001 },
      { cost: 0.0000012, min: 256001 },
    ],
    output_cost_per_token_tiers: [
      { cost: 0.0000024, min: 0, max: 256001 },
      { cost: 0.0000072, min: 256001 },
    ],
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/alibaba/qwen3.6-plus',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 0.000003,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/amazon/nova-2-lite',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000025,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/amazon/nova-lite',
    input_cost_per_token: 6e-8,
    output_cost_per_token: 2.4e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/amazon/nova-micro',
    input_cost_per_token: 3.5e-8,
    output_cost_per_token: 1.4e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/amazon/nova-pro',
    input_cost_per_token: 8e-7,
    output_cost_per_token: 0.0000032,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/anthropic/claude-3-haiku',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 0.00000125,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/anthropic/claude-3.5-haiku',
    input_cost_per_token: 8e-7,
    output_cost_per_token: 0.000004,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/anthropic/claude-3.7-sonnet',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/anthropic/claude-haiku-4.5',
    input_cost_per_token: 0.000001,
    output_cost_per_token: 0.000005,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/anthropic/claude-opus-4',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.000075,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/anthropic/claude-opus-4.1',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.000075,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/anthropic/claude-opus-4.5',
    input_cost_per_token: 0.000005,
    output_cost_per_token: 0.000025,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/anthropic/claude-opus-4.6',
    input_cost_per_token: 0.000005,
    output_cost_per_token: 0.000025,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/anthropic/claude-opus-4.7',
    input_cost_per_token: 0.000005,
    output_cost_per_token: 0.000025,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/anthropic/claude-sonnet-4',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    input_cost_per_token_tiers: [
      { cost: 0.000003, min: 0, max: 200001 },
      { cost: 0.000006, min: 200001 },
    ],
    output_cost_per_token_tiers: [
      { cost: 0.000015, min: 0, max: 200001 },
      { cost: 0.0000225, min: 200001 },
    ],
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/anthropic/claude-sonnet-4.5',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    input_cost_per_token_tiers: [
      { cost: 0.000003, min: 0, max: 200001 },
      { cost: 0.000006, min: 200001 },
    ],
    output_cost_per_token_tiers: [
      { cost: 0.000015, min: 0, max: 200001 },
      { cost: 0.0000225, min: 200001 },
    ],
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/anthropic/claude-sonnet-4.6',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/arcee-ai/trinity-large-preview',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 0.000001,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/arcee-ai/trinity-large-thinking',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 9e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/arcee-ai/trinity-mini',
    input_cost_per_token: 4.5e-8,
    output_cost_per_token: 1.5e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/bytedance/seed-1.6',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 0.000002,
    input_cost_per_token_tiers: [
      { cost: 2.5e-7, min: 0, max: 128001 },
      { cost: 5e-7, min: 128001 },
    ],
    output_cost_per_token_tiers: [
      { cost: 0.000002, min: 0, max: 128001 },
      { cost: 0.000004, min: 128001 },
    ],
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/bytedance/seed-1.8',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 0.000002,
    input_cost_per_token_tiers: [
      { cost: 2.5e-7, min: 0, max: 128001 },
      { cost: 5e-7, min: 128001 },
    ],
    output_cost_per_token_tiers: [
      { cost: 0.000002, min: 0, max: 128001 },
      { cost: 0.000004, min: 128001 },
    ],
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/cohere/command-a',
    input_cost_per_token: 0.0000025,
    output_cost_per_token: 0.00001,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/deepseek/deepseek-r1',
    input_cost_per_token: 0.00000135,
    output_cost_per_token: 0.0000054,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/deepseek/deepseek-v3',
    input_cost_per_token: 7.7e-7,
    output_cost_per_token: 7.7e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/deepseek/deepseek-v3.1',
    input_cost_per_token: 5.6e-7,
    output_cost_per_token: 0.00000168,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/deepseek/deepseek-v3.1-terminus',
    input_cost_per_token: 2.7e-7,
    output_cost_per_token: 0.000001,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/deepseek/deepseek-v3.2',
    input_cost_per_token: 2.8e-7,
    output_cost_per_token: 4.2e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/deepseek/deepseek-v3.2-thinking',
    input_cost_per_token: 2.8e-7,
    output_cost_per_token: 4.2e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/deepseek/deepseek-v4-flash',
    input_cost_per_token: 1.4e-7,
    output_cost_per_token: 2.8e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/deepseek/deepseek-v4-pro',
    input_cost_per_token: 0.00000174,
    output_cost_per_token: 0.00000348,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/google/gemini-2.0-flash',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 6e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/google/gemini-2.0-flash-lite',
    input_cost_per_token: 7.5e-8,
    output_cost_per_token: 3e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/google/gemini-2.5-flash',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000025,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/google/gemini-2.5-flash-image',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000025,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/google/gemini-2.5-flash-lite',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 4e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/google/gemini-2.5-pro',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    input_cost_per_token_tiers: [
      { cost: 0.00000125, min: 0, max: 200001 },
      { cost: 0.0000025, min: 200001 },
    ],
    output_cost_per_token_tiers: [
      { cost: 0.00001, min: 0, max: 200001 },
      { cost: 0.000015, min: 200001 },
    ],
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/google/gemini-3-flash',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 0.000003,
    input_cost_per_token_tiers: [
      { cost: 5e-7, min: 0, max: 200001 },
      { cost: 5e-7, min: 200001 },
    ],
    output_cost_per_token_tiers: [
      { cost: 0.000003, min: 0, max: 200001 },
      { cost: 0.000003, min: 200001 },
    ],
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/google/gemini-3-pro-image',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000012,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/google/gemini-3-pro-preview',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000012,
    input_cost_per_token_tiers: [
      { cost: 0.000002, min: 0, max: 200001 },
      { cost: 0.000004, min: 200001 },
    ],
    output_cost_per_token_tiers: [
      { cost: 0.000012, min: 0, max: 200001 },
      { cost: 0.000018, min: 200001 },
    ],
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/google/gemini-3.1-flash-image-preview',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 0.000003,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/google/gemini-3.1-flash-lite-preview',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 0.0000015,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/google/gemini-3.1-pro-preview',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000012,
    input_cost_per_token_tiers: [
      { cost: 0.000002, min: 0, max: 200001 },
      { cost: 0.000004, min: 200001 },
    ],
    output_cost_per_token_tiers: [
      { cost: 0.000012, min: 0, max: 200001 },
      { cost: 0.000018, min: 200001 },
    ],
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/google/gemma-4-26b-a4b-it',
    input_cost_per_token: 1.3e-7,
    output_cost_per_token: 4e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/google/gemma-4-31b-it',
    input_cost_per_token: 1.4e-7,
    output_cost_per_token: 4e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/inception/mercury-2',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 7.5e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/inception/mercury-coder-small',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 0.000001,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/kwaipilot/kat-coder-pro-v1',
    input_cost_per_token: 3e-8,
    output_cost_per_token: 0.0000012,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/kwaipilot/kat-coder-pro-v2',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000012,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/meta/llama-3.1-70b',
    input_cost_per_token: 7.2e-7,
    output_cost_per_token: 7.2e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/meta/llama-3.1-8b',
    input_cost_per_token: 2.2e-7,
    output_cost_per_token: 2.2e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/meta/llama-3.2-11b',
    input_cost_per_token: 1.6e-7,
    output_cost_per_token: 1.6e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/meta/llama-3.2-1b',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 1e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/meta/llama-3.2-3b',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 1.5e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/meta/llama-3.2-90b',
    input_cost_per_token: 7.2e-7,
    output_cost_per_token: 7.2e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/meta/llama-3.3-70b',
    input_cost_per_token: 7.2e-7,
    output_cost_per_token: 7.2e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/meta/llama-4-maverick',
    input_cost_per_token: 2.4e-7,
    output_cost_per_token: 9.7e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/meta/llama-4-scout',
    input_cost_per_token: 1.7e-7,
    output_cost_per_token: 6.6e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/minimax/minimax-m2',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000012,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/minimax/minimax-m2.1',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000012,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/minimax/minimax-m2.1-lightning',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000024,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/minimax/minimax-m2.5',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000012,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/minimax/minimax-m2.5-highspeed',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 0.0000024,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/minimax/minimax-m2.7',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000012,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/minimax/minimax-m2.7-highspeed',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 0.0000024,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/mistral/codestral',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 9e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/mistral/devstral-2',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.000002,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/mistral/devstral-small',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 3e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/mistral/devstral-small-2',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 3e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/mistral/magistral-medium',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000005,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/mistral/magistral-small',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 0.0000015,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/mistral/ministral-14b',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 2e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/mistral/ministral-3b',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 1e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/mistral/ministral-8b',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 1.5e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/mistral/mistral-large-3',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 0.0000015,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/mistral/mistral-medium',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.000002,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/mistral/mistral-nemo',
    input_cost_per_token: 2e-8,
    output_cost_per_token: 4e-8,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/mistral/mistral-small',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 3e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/mistral/mixtral-8x22b-instruct',
    input_cost_per_token: 0.0000012,
    output_cost_per_token: 0.0000012,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/mistral/pixtral-12b',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 1.5e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/mistral/pixtral-large',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000006,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/moonshotai/kimi-k2',
    input_cost_per_token: 5.7e-7,
    output_cost_per_token: 0.0000023,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/moonshotai/kimi-k2-0905',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 0.0000025,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/moonshotai/kimi-k2-thinking',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 0.0000025,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/moonshotai/kimi-k2-thinking-turbo',
    input_cost_per_token: 0.00000115,
    output_cost_per_token: 0.000008,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/moonshotai/kimi-k2-turbo',
    input_cost_per_token: 0.00000115,
    output_cost_per_token: 0.000008,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/moonshotai/kimi-k2.5',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 0.000003,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/moonshotai/kimi-k2.6',
    input_cost_per_token: 9.5e-7,
    output_cost_per_token: 0.000004,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/morph/morph-v3-fast',
    input_cost_per_token: 8e-7,
    output_cost_per_token: 0.0000012,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/morph/morph-v3-large',
    input_cost_per_token: 9e-7,
    output_cost_per_token: 0.0000019,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/nvidia/nemotron-3-nano-30b-a3b',
    input_cost_per_token: 5e-8,
    output_cost_per_token: 2.4e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/nvidia/nemotron-3-super-120b-a12b',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 6.5e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/nvidia/nemotron-nano-12b-v2-vl',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 6e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/nvidia/nemotron-nano-9b-v2',
    input_cost_per_token: 6e-8,
    output_cost_per_token: 2.3e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/gpt-3.5-turbo',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 0.0000015,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/gpt-3.5-turbo-instruct',
    input_cost_per_token: 0.0000015,
    output_cost_per_token: 0.000002,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/gpt-4-turbo',
    input_cost_per_token: 0.00001,
    output_cost_per_token: 0.00003,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/gpt-4.1',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000008,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/gpt-4.1-mini',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.0000016,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/gpt-4.1-nano',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 4e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/gpt-4o',
    input_cost_per_token: 0.0000025,
    output_cost_per_token: 0.00001,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/gpt-4o-mini',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 6e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/gpt-4o-mini-search-preview',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 6e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/gpt-5',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/gpt-5-chat',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/gpt-5-codex',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/gpt-5-mini',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 0.000002,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/gpt-5-nano',
    input_cost_per_token: 5e-8,
    output_cost_per_token: 4e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/gpt-5-pro',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.00012,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/gpt-5.1-codex',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/gpt-5.1-codex-max',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/gpt-5.1-codex-mini',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 0.000002,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/gpt-5.1-instant',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/gpt-5.1-thinking',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/gpt-5.2',
    input_cost_per_token: 0.00000175,
    output_cost_per_token: 0.000014,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/gpt-5.2-chat',
    input_cost_per_token: 0.00000175,
    output_cost_per_token: 0.000014,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/gpt-5.2-codex',
    input_cost_per_token: 0.00000175,
    output_cost_per_token: 0.000014,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/gpt-5.2-pro',
    input_cost_per_token: 0.000021,
    output_cost_per_token: 0.000168,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/gpt-5.3-chat',
    input_cost_per_token: 0.00000175,
    output_cost_per_token: 0.000014,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/gpt-5.3-codex',
    input_cost_per_token: 0.00000175,
    output_cost_per_token: 0.000014,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/gpt-5.4',
    input_cost_per_token: 0.0000025,
    output_cost_per_token: 0.000015,
    input_cost_per_token_tiers: [
      { cost: 0.0000025, min: 0, max: 272000 },
      { cost: 0.000005, min: 272000 },
    ],
    output_cost_per_token_tiers: [
      { cost: 0.000015, min: 0, max: 272000 },
      { cost: 0.0000225, min: 272000 },
    ],
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/gpt-5.4-mini',
    input_cost_per_token: 7.5e-7,
    output_cost_per_token: 0.0000045,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/gpt-5.4-nano',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 0.00000125,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/gpt-5.4-pro',
    input_cost_per_token: 0.00003,
    output_cost_per_token: 0.00018,
    input_cost_per_token_tiers: [
      { cost: 0.00003, min: 0, max: 272000 },
      { cost: 0.00006, min: 272000 },
    ],
    output_cost_per_token_tiers: [
      { cost: 0.00018, min: 0, max: 272000 },
      { cost: 0.00027, min: 272000 },
    ],
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/gpt-5.5',
    input_cost_per_token: 0.000005,
    output_cost_per_token: 0.00003,
    input_cost_per_token_tiers: [
      { cost: 0.000005, min: 0, max: 272000 },
      { cost: 0.00001, min: 272000 },
    ],
    output_cost_per_token_tiers: [
      { cost: 0.00003, min: 0, max: 272000 },
      { cost: 0.000045, min: 272000 },
    ],
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/gpt-5.5-pro',
    input_cost_per_token: 0.00003,
    output_cost_per_token: 0.00018,
    input_cost_per_token_tiers: [
      { cost: 0.00003, min: 0, max: 272000 },
      { cost: 0.00006, min: 272000 },
    ],
    output_cost_per_token_tiers: [
      { cost: 0.00018, min: 0, max: 272000 },
      { cost: 0.00027, min: 272000 },
    ],
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/gpt-oss-120b',
    input_cost_per_token: 3.5e-7,
    output_cost_per_token: 7.5e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/gpt-oss-20b',
    input_cost_per_token: 5e-8,
    output_cost_per_token: 2e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/gpt-oss-safeguard-20b',
    input_cost_per_token: 7.5e-8,
    output_cost_per_token: 3e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/o1',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.00006,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/o3',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000008,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/o3-deep-research',
    input_cost_per_token: 0.00001,
    output_cost_per_token: 0.00004,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/o3-mini',
    input_cost_per_token: 0.0000011,
    output_cost_per_token: 0.0000044,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/o3-pro',
    input_cost_per_token: 0.00002,
    output_cost_per_token: 0.00008,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/openai/o4-mini',
    input_cost_per_token: 0.0000011,
    output_cost_per_token: 0.0000044,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/prime-intellect/intellect-3',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 0.0000011,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/xai/grok-3',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/xai/grok-3-fast',
    input_cost_per_token: 0.000005,
    output_cost_per_token: 0.000025,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/xai/grok-3-mini',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 5e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/xai/grok-3-mini-fast',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 0.000004,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/xai/grok-4',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    input_cost_per_token_tiers: [
      { cost: 0.000003, min: 0, max: 128001 },
      { cost: 0.000006, min: 128000 },
    ],
    output_cost_per_token_tiers: [
      { cost: 0.000015, min: 0, max: 128001 },
      { cost: 0.00003, min: 128000 },
    ],
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/xai/grok-4-fast-non-reasoning',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 5e-7,
    input_cost_per_token_tiers: [
      { cost: 2e-7, min: 0, max: 128001 },
      { cost: 4e-7, min: 128001 },
    ],
    output_cost_per_token_tiers: [
      { cost: 5e-7, min: 0, max: 128001 },
      { cost: 0.000001, min: 128001 },
    ],
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/xai/grok-4-fast-reasoning',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 5e-7,
    input_cost_per_token_tiers: [
      { cost: 2e-7, min: 0, max: 128001 },
      { cost: 4e-7, min: 128001 },
    ],
    output_cost_per_token_tiers: [
      { cost: 5e-7, min: 0, max: 128001 },
      { cost: 0.000001, min: 128001 },
    ],
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/xai/grok-4.1-fast-non-reasoning',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 5e-7,
    input_cost_per_token_tiers: [
      { cost: 2e-7, min: 0, max: 128001 },
      { cost: 4e-7, min: 128001 },
    ],
    output_cost_per_token_tiers: [
      { cost: 5e-7, min: 0, max: 128001 },
      { cost: 0.000001, min: 128001 },
    ],
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/xai/grok-4.1-fast-reasoning',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 5e-7,
    input_cost_per_token_tiers: [
      { cost: 2e-7, min: 0, max: 128001 },
      { cost: 4e-7, min: 128001 },
    ],
    output_cost_per_token_tiers: [
      { cost: 5e-7, min: 0, max: 128001 },
      { cost: 0.000001, min: 128001 },
    ],
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/xai/grok-4.20-multi-agent',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000006,
    input_cost_per_token_tiers: [
      { cost: 0.000002, min: 0, max: 200001 },
      { cost: 0.000004, min: 200001 },
    ],
    output_cost_per_token_tiers: [
      { cost: 0.000006, min: 0, max: 200001 },
      { cost: 0.000012, min: 200001 },
    ],
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/xai/grok-4.20-multi-agent-beta',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000006,
    input_cost_per_token_tiers: [
      { cost: 0.000002, min: 0, max: 200001 },
      { cost: 0.000004, min: 200001 },
    ],
    output_cost_per_token_tiers: [
      { cost: 0.000006, min: 0, max: 200001 },
      { cost: 0.000012, min: 200001 },
    ],
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/xai/grok-4.20-non-reasoning',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000006,
    input_cost_per_token_tiers: [
      { cost: 0.000002, min: 0, max: 200001 },
      { cost: 0.000004, min: 200001 },
    ],
    output_cost_per_token_tiers: [
      { cost: 0.000006, min: 0, max: 200001 },
      { cost: 0.000012, min: 200001 },
    ],
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/xai/grok-4.20-non-reasoning-beta',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000006,
    input_cost_per_token_tiers: [
      { cost: 0.000002, min: 0, max: 200001 },
      { cost: 0.000004, min: 200001 },
    ],
    output_cost_per_token_tiers: [
      { cost: 0.000006, min: 0, max: 200001 },
      { cost: 0.000012, min: 200001 },
    ],
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/xai/grok-4.20-reasoning',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000006,
    input_cost_per_token_tiers: [
      { cost: 0.000002, min: 0, max: 200001 },
      { cost: 0.000004, min: 200001 },
    ],
    output_cost_per_token_tiers: [
      { cost: 0.000006, min: 0, max: 200001 },
      { cost: 0.000012, min: 200001 },
    ],
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/xai/grok-4.20-reasoning-beta',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000006,
    input_cost_per_token_tiers: [
      { cost: 0.000002, min: 0, max: 200001 },
      { cost: 0.000004, min: 200001 },
    ],
    output_cost_per_token_tiers: [
      { cost: 0.000006, min: 0, max: 200001 },
      { cost: 0.000012, min: 200001 },
    ],
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/xai/grok-code-fast-1',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 0.0000015,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/xiaomi/mimo-v2-flash',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 3e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/xiaomi/mimo-v2-pro',
    input_cost_per_token: 0.000001,
    output_cost_per_token: 0.000003,
    input_cost_per_token_tiers: [
      { cost: 0.000001, min: 0, max: 256001 },
      { cost: 0.000002, min: 256001 },
    ],
    output_cost_per_token_tiers: [
      { cost: 0.000003, min: 0, max: 256001 },
      { cost: 0.000006, min: 256001 },
    ],
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/zai/glm-4.5',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 0.0000022,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/zai/glm-4.5-air',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 0.0000011,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/zai/glm-4.5v',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 0.0000018,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/zai/glm-4.6',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 0.0000022,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/zai/glm-4.6v',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 9e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/zai/glm-4.7',
    input_cost_per_token: 0.00000225,
    output_cost_per_token: 0.00000275,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/zai/glm-4.7-flash',
    input_cost_per_token: 7e-8,
    output_cost_per_token: 4e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/zai/glm-4.7-flashx',
    input_cost_per_token: 6e-8,
    output_cost_per_token: 4e-7,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/zai/glm-5',
    input_cost_per_token: 0.000001,
    output_cost_per_token: 0.0000032,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/zai/glm-5-turbo',
    input_cost_per_token: 0.0000012,
    output_cost_per_token: 0.000004,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/zai/glm-5.1',
    input_cost_per_token: 0.0000014,
    output_cost_per_token: 0.0000044,
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'vercel/zai/glm-5v-turbo',
    input_cost_per_token: 0.0000012,
    output_cost_per_token: 0.000004,
    provider: 'Vercel AI Gateway',
  },
];
