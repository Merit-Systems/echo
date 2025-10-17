import { SupportedModel } from '../types';

// Union type of all valid OpenRouter model IDs
export type OpenRouterModel =
  | 'ai21/jamba-large-1.7'
  | 'ai21/jamba-mini-1.7'
  | 'aion-labs/aion-1.0'
  | 'aion-labs/aion-1.0-mini'
  | 'aion-labs/aion-rp-llama-3.1-8b'
  | 'alfredpros/codellama-7b-instruct-solidity'
  | 'alibaba/tongyi-deepresearch-30b-a3b'
  | 'allenai/molmo-7b-d'
  | 'allenai/olmo-2-0325-32b-instruct'
  | 'alpindale/goliath-120b'
  | 'amazon/nova-lite-v1'
  | 'amazon/nova-micro-v1'
  | 'amazon/nova-pro-v1'
  | 'anthracite-org/magnum-v4-72b'
  | 'anthropic/claude-3-haiku'
  | 'anthropic/claude-3-opus'
  | 'anthropic/claude-3.5-haiku'
  | 'anthropic/claude-3.5-sonnet'
  | 'anthropic/claude-3.5-sonnet-20240620'
  | 'anthropic/claude-3.7-sonnet'
  | 'anthropic/claude-3.7-sonnet:thinking'
  | 'anthropic/claude-haiku-4.5'
  | 'anthropic/claude-opus-4'
  | 'anthropic/claude-opus-4.1'
  | 'anthropic/claude-sonnet-4'
  | 'anthropic/claude-sonnet-4.5'
  | 'arcee-ai/afm-4.5b'
  | 'arcee-ai/coder-large'
  | 'arcee-ai/maestro-reasoning'
  | 'arcee-ai/virtuoso-large'
  | 'baidu/ernie-4.5-21b-a3b'
  | 'baidu/ernie-4.5-21b-a3b-thinking'
  | 'baidu/ernie-4.5-300b-a47b'
  | 'baidu/ernie-4.5-vl-28b-a3b'
  | 'baidu/ernie-4.5-vl-424b-a47b'
  | 'bytedance/ui-tars-1.5-7b'
  | 'cognitivecomputations/dolphin3.0-mistral-24b'
  | 'cohere/command-a'
  | 'cohere/command-r-08-2024'
  | 'cohere/command-r-plus-08-2024'
  | 'cohere/command-r7b-12-2024'
  | 'deepcogito/cogito-v2-preview-deepseek-671b'
  | 'deepcogito/cogito-v2-preview-llama-109b-moe'
  | 'deepcogito/cogito-v2-preview-llama-405b'
  | 'deepcogito/cogito-v2-preview-llama-70b'
  | 'deepseek/deepseek-chat'
  | 'deepseek/deepseek-chat-v3-0324'
  | 'deepseek/deepseek-chat-v3.1'
  | 'deepseek/deepseek-prover-v2'
  | 'deepseek/deepseek-r1'
  | 'deepseek/deepseek-r1-0528'
  | 'deepseek/deepseek-r1-0528-qwen3-8b'
  | 'deepseek/deepseek-r1-distill-llama-70b'
  | 'deepseek/deepseek-r1-distill-qwen-14b'
  | 'deepseek/deepseek-r1-distill-qwen-32b'
  | 'deepseek/deepseek-v3.1-terminus'
  | 'deepseek/deepseek-v3.2-exp'
  | 'eleutherai/llemma_7b'
  | 'google/gemini-2.0-flash-001'
  | 'google/gemini-2.0-flash-lite-001'
  | 'google/gemini-2.5-flash'
  | 'google/gemini-2.5-flash-lite'
  | 'google/gemini-2.5-flash-lite-preview-06-17'
  | 'google/gemini-2.5-flash-lite-preview-09-2025'
  | 'google/gemini-2.5-flash-preview-09-2025'
  | 'google/gemini-2.5-pro'
  | 'google/gemini-2.5-pro-preview'
  | 'google/gemini-2.5-pro-preview-05-06'
  | 'google/gemma-2-27b-it'
  | 'google/gemma-2-9b-it'
  | 'google/gemma-3-12b-it'
  | 'google/gemma-3-27b-it'
  | 'google/gemma-3-4b-it'
  | 'google/gemma-3n-e4b-it'
  | 'gryphe/mythomax-l2-13b'
  | 'inception/mercury'
  | 'inception/mercury-coder'
  | 'inclusionai/ling-1t'
  | 'inclusionai/ring-1t'
  | 'inflection/inflection-3-pi'
  | 'inflection/inflection-3-productivity'
  | 'liquid/lfm-3b'
  | 'liquid/lfm-7b'
  | 'mancer/weaver'
  | 'meituan/longcat-flash-chat'
  | 'meta-llama/llama-3-70b-instruct'
  | 'meta-llama/llama-3-8b-instruct'
  | 'meta-llama/llama-3.1-405b'
  | 'meta-llama/llama-3.1-405b-instruct'
  | 'meta-llama/llama-3.1-70b-instruct'
  | 'meta-llama/llama-3.1-8b-instruct'
  | 'meta-llama/llama-3.2-11b-vision-instruct'
  | 'meta-llama/llama-3.2-1b-instruct'
  | 'meta-llama/llama-3.2-3b-instruct'
  | 'meta-llama/llama-3.2-90b-vision-instruct'
  | 'meta-llama/llama-3.3-70b-instruct'
  | 'meta-llama/llama-4-maverick'
  | 'meta-llama/llama-4-scout'
  | 'meta-llama/llama-guard-2-8b'
  | 'meta-llama/llama-guard-3-8b'
  | 'meta-llama/llama-guard-4-12b'
  | 'microsoft/mai-ds-r1'
  | 'microsoft/phi-3-medium-128k-instruct'
  | 'microsoft/phi-3-mini-128k-instruct'
  | 'microsoft/phi-3.5-mini-128k-instruct'
  | 'microsoft/phi-4'
  | 'microsoft/phi-4-multimodal-instruct'
  | 'microsoft/phi-4-reasoning-plus'
  | 'microsoft/wizardlm-2-8x22b'
  | 'minimax/minimax-m1'
  | 'mistralai/codestral-2501'
  | 'mistralai/codestral-2508'
  | 'mistralai/devstral-medium'
  | 'mistralai/devstral-small'
  | 'mistralai/devstral-small-2505'
  | 'mistralai/magistral-medium-2506'
  | 'mistralai/magistral-medium-2506:thinking'
  | 'mistralai/magistral-small-2506'
  | 'mistralai/ministral-3b'
  | 'mistralai/ministral-8b'
  | 'mistralai/mistral-7b-instruct'
  | 'mistralai/mistral-7b-instruct-v0.1'
  | 'mistralai/mistral-7b-instruct-v0.2'
  | 'mistralai/mistral-7b-instruct-v0.3'
  | 'mistralai/mistral-large'
  | 'mistralai/mistral-large-2407'
  | 'mistralai/mistral-large-2411'
  | 'mistralai/mistral-medium-3'
  | 'mistralai/mistral-medium-3.1'
  | 'mistralai/mistral-nemo'
  | 'mistralai/mistral-saba'
  | 'mistralai/mistral-small'
  | 'mistralai/mistral-small-24b-instruct-2501'
  | 'mistralai/mistral-small-3.1-24b-instruct'
  | 'mistralai/mistral-small-3.2-24b-instruct'
  | 'mistralai/mistral-tiny'
  | 'mistralai/mixtral-8x22b-instruct'
  | 'mistralai/mixtral-8x7b-instruct'
  | 'mistralai/pixtral-12b'
  | 'mistralai/pixtral-large-2411'
  | 'moonshotai/kimi-dev-72b'
  | 'moonshotai/kimi-k2'
  | 'moonshotai/kimi-k2-0905'
  | 'morph/morph-v3-fast'
  | 'morph/morph-v3-large'
  | 'neversleep/llama-3.1-lumimaid-8b'
  | 'neversleep/noromaid-20b'
  | 'nousresearch/deephermes-3-llama-3-8b-preview'
  | 'nousresearch/deephermes-3-mistral-24b-preview'
  | 'nousresearch/hermes-2-pro-llama-3-8b'
  | 'nousresearch/hermes-3-llama-3.1-405b'
  | 'nousresearch/hermes-4-405b'
  | 'nousresearch/hermes-4-70b'
  | 'nvidia/llama-3.1-nemotron-70b-instruct'
  | 'nvidia/llama-3.1-nemotron-ultra-253b-v1'
  | 'nvidia/llama-3.3-nemotron-super-49b-v1.5'
  | 'nvidia/nemotron-nano-9b-v2'
  | 'openai/chatgpt-4o-latest'
  | 'openai/codex-mini'
  | 'openai/gpt-3.5-turbo'
  | 'openai/gpt-3.5-turbo-0613'
  | 'openai/gpt-3.5-turbo-16k'
  | 'openai/gpt-3.5-turbo-instruct'
  | 'openai/gpt-4'
  | 'openai/gpt-4-0314'
  | 'openai/gpt-4-1106-preview'
  | 'openai/gpt-4-turbo'
  | 'openai/gpt-4-turbo-preview'
  | 'openai/gpt-4.1'
  | 'openai/gpt-4.1-mini'
  | 'openai/gpt-4.1-nano'
  | 'openai/gpt-4o'
  | 'openai/gpt-4o-2024-05-13'
  | 'openai/gpt-4o-2024-08-06'
  | 'openai/gpt-4o-2024-11-20'
  | 'openai/gpt-4o-mini'
  | 'openai/gpt-4o-mini-2024-07-18'
  | 'openai/gpt-4o-mini-search-preview'
  | 'openai/gpt-4o-search-preview'
  | 'openai/gpt-4o:extended'
  | 'openai/gpt-5'
  | 'openai/gpt-5-chat'
  | 'openai/gpt-5-codex'
  | 'openai/gpt-5-mini'
  | 'openai/gpt-5-nano'
  | 'openai/gpt-5-pro'
  | 'openai/gpt-oss-120b'
  | 'openai/gpt-oss-20b'
  | 'openai/o1'
  | 'openai/o1-mini'
  | 'openai/o1-mini-2024-09-12'
  | 'openai/o1-pro'
  | 'openai/o3'
  | 'openai/o3-deep-research'
  | 'openai/o3-mini'
  | 'openai/o3-mini-high'
  | 'openai/o3-pro'
  | 'openai/o4-mini'
  | 'openai/o4-mini-deep-research'
  | 'openai/o4-mini-high'
  | 'opengvlab/internvl3-78b'
  | 'perplexity/sonar'
  | 'perplexity/sonar-deep-research'
  | 'perplexity/sonar-pro'
  | 'perplexity/sonar-reasoning'
  | 'perplexity/sonar-reasoning-pro'
  | 'qwen/qwen-2.5-72b-instruct'
  | 'qwen/qwen-2.5-7b-instruct'
  | 'qwen/qwen-2.5-vl-7b-instruct'
  | 'qwen/qwen-max'
  | 'qwen/qwen-plus'
  | 'qwen/qwen-plus-2025-07-28'
  | 'qwen/qwen-plus-2025-07-28:thinking'
  | 'qwen/qwen-turbo'
  | 'qwen/qwen-vl-max'
  | 'qwen/qwen-vl-plus'
  | 'qwen/qwen2.5-coder-7b-instruct'
  | 'qwen/qwen2.5-vl-32b-instruct'
  | 'qwen/qwen2.5-vl-72b-instruct'
  | 'qwen/qwen3-14b'
  | 'qwen/qwen3-235b-a22b'
  | 'qwen/qwen3-235b-a22b-2507'
  | 'qwen/qwen3-235b-a22b-thinking-2507'
  | 'qwen/qwen3-30b-a3b'
  | 'qwen/qwen3-30b-a3b-instruct-2507'
  | 'qwen/qwen3-30b-a3b-thinking-2507'
  | 'qwen/qwen3-32b'
  | 'qwen/qwen3-8b'
  | 'qwen/qwen3-coder'
  | 'qwen/qwen3-coder-30b-a3b-instruct'
  | 'qwen/qwen3-coder-flash'
  | 'qwen/qwen3-coder-plus'
  | 'qwen/qwen3-max'
  | 'qwen/qwen3-next-80b-a3b-instruct'
  | 'qwen/qwen3-vl-235b-a22b-instruct'
  | 'qwen/qwen3-vl-235b-a22b-thinking'
  | 'qwen/qwen3-vl-30b-a3b-instruct'
  | 'qwen/qwen3-vl-30b-a3b-thinking'
  | 'qwen/qwen3-vl-8b-instruct'
  | 'qwen/qwen3-vl-8b-thinking'
  | 'qwen/qwq-32b'
  | 'raifle/sorcererlm-8x22b'
  | 'sao10k/l3-euryale-70b'
  | 'sao10k/l3-lunaris-8b'
  | 'sao10k/l3.1-70b-hanami-x1'
  | 'sao10k/l3.1-euryale-70b'
  | 'sao10k/l3.3-euryale-70b'
  | 'shisa-ai/shisa-v2-llama3.3-70b'
  | 'stepfun-ai/step3'
  | 'switchpoint/router'
  | 'tencent/hunyuan-a13b-instruct'
  | 'thedrummer/anubis-70b-v1.1'
  | 'thedrummer/cydonia-24b-v4.1'
  | 'thedrummer/rocinante-12b'
  | 'thedrummer/skyfall-36b-v2'
  | 'thedrummer/unslopnemo-12b'
  | 'thudm/glm-4.1v-9b-thinking'
  | 'thudm/glm-z1-32b'
  | 'tngtech/deepseek-r1t-chimera'
  | 'tngtech/deepseek-r1t2-chimera'
  | 'undi95/remm-slerp-l2-13b'
  | 'x-ai/grok-3'
  | 'x-ai/grok-3-beta'
  | 'x-ai/grok-3-mini'
  | 'x-ai/grok-3-mini-beta'
  | 'x-ai/grok-4'
  | 'x-ai/grok-4-fast'
  | 'x-ai/grok-code-fast-1'
  | 'z-ai/glm-4-32b'
  | 'z-ai/glm-4.5'
  | 'z-ai/glm-4.5-air'
  | 'z-ai/glm-4.5v'
  | 'z-ai/glm-4.6';

export const OpenRouterModels: SupportedModel[] = [
  {
    model_id: 'ai21/jamba-large-1.7',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000008,
    provider: 'OpenRouter',
  },
  {
    model_id: 'ai21/jamba-mini-1.7',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 4e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'aion-labs/aion-1.0',
    input_cost_per_token: 0.000004,
    output_cost_per_token: 0.000008,
    provider: 'OpenRouter',
  },
  {
    model_id: 'aion-labs/aion-1.0-mini',
    input_cost_per_token: 7e-7,
    output_cost_per_token: 0.0000014,
    provider: 'OpenRouter',
  },
  {
    model_id: 'aion-labs/aion-rp-llama-3.1-8b',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 2e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'alfredpros/codellama-7b-instruct-solidity',
    input_cost_per_token: 8e-7,
    output_cost_per_token: 0.0000012,
    provider: 'OpenRouter',
  },
  {
    model_id: 'alibaba/tongyi-deepresearch-30b-a3b',
    input_cost_per_token: 9e-8,
    output_cost_per_token: 4e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'allenai/molmo-7b-d',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 2e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'allenai/olmo-2-0325-32b-instruct',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 3.5e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'alpindale/goliath-120b',
    input_cost_per_token: 0.000004,
    output_cost_per_token: 0.0000055,
    provider: 'OpenRouter',
  },
  {
    model_id: 'amazon/nova-lite-v1',
    input_cost_per_token: 6e-8,
    output_cost_per_token: 2.4e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'amazon/nova-micro-v1',
    input_cost_per_token: 3.5e-8,
    output_cost_per_token: 1.4e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'amazon/nova-pro-v1',
    input_cost_per_token: 8e-7,
    output_cost_per_token: 0.0000032,
    provider: 'OpenRouter',
  },
  {
    model_id: 'anthracite-org/magnum-v4-72b',
    input_cost_per_token: 0.0000025,
    output_cost_per_token: 0.000005,
    provider: 'OpenRouter',
  },
  {
    model_id: 'anthropic/claude-3-haiku',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 0.00000125,
    provider: 'OpenRouter',
  },
  {
    model_id: 'anthropic/claude-3-opus',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.000075,
    provider: 'OpenRouter',
  },
  {
    model_id: 'anthropic/claude-3.5-haiku',
    input_cost_per_token: 8e-7,
    output_cost_per_token: 0.000004,
    provider: 'OpenRouter',
  },
  {
    model_id: 'anthropic/claude-3.5-sonnet',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'OpenRouter',
  },
  {
    model_id: 'anthropic/claude-3.5-sonnet-20240620',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'OpenRouter',
  },
  {
    model_id: 'anthropic/claude-3.7-sonnet',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'OpenRouter',
  },
  {
    model_id: 'anthropic/claude-3.7-sonnet:thinking',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'OpenRouter',
  },
  {
    model_id: 'anthropic/claude-haiku-4.5',
    input_cost_per_token: 0.000001,
    output_cost_per_token: 0.000005,
    provider: 'OpenRouter',
  },
  {
    model_id: 'anthropic/claude-opus-4',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.000075,
    provider: 'OpenRouter',
  },
  {
    model_id: 'anthropic/claude-opus-4.1',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.000075,
    provider: 'OpenRouter',
  },
  {
    model_id: 'anthropic/claude-sonnet-4',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'OpenRouter',
  },
  {
    model_id: 'anthropic/claude-sonnet-4.5',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'OpenRouter',
  },
  {
    model_id: 'arcee-ai/afm-4.5b',
    input_cost_per_token: 4.8e-8,
    output_cost_per_token: 1.5e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'arcee-ai/coder-large',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 8e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'arcee-ai/maestro-reasoning',
    input_cost_per_token: 9e-7,
    output_cost_per_token: 0.0000033,
    provider: 'OpenRouter',
  },
  {
    model_id: 'arcee-ai/virtuoso-large',
    input_cost_per_token: 7.5e-7,
    output_cost_per_token: 0.0000012,
    provider: 'OpenRouter',
  },
  {
    model_id: 'baidu/ernie-4.5-21b-a3b',
    input_cost_per_token: 7e-8,
    output_cost_per_token: 2.8e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'baidu/ernie-4.5-21b-a3b-thinking',
    input_cost_per_token: 7e-8,
    output_cost_per_token: 2.8e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'baidu/ernie-4.5-300b-a47b',
    input_cost_per_token: 2.8e-7,
    output_cost_per_token: 0.0000011,
    provider: 'OpenRouter',
  },
  {
    model_id: 'baidu/ernie-4.5-vl-28b-a3b',
    input_cost_per_token: 1.4e-7,
    output_cost_per_token: 5.6e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'baidu/ernie-4.5-vl-424b-a47b',
    input_cost_per_token: 4.2e-7,
    output_cost_per_token: 0.00000125,
    provider: 'OpenRouter',
  },
  {
    model_id: 'bytedance/ui-tars-1.5-7b',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 2e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'cognitivecomputations/dolphin3.0-mistral-24b',
    input_cost_per_token: 4e-8,
    output_cost_per_token: 1.7e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'cohere/command-a',
    input_cost_per_token: 0.0000025,
    output_cost_per_token: 0.00001,
    provider: 'OpenRouter',
  },
  {
    model_id: 'cohere/command-r-08-2024',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 6e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'cohere/command-r-plus-08-2024',
    input_cost_per_token: 0.0000025,
    output_cost_per_token: 0.00001,
    provider: 'OpenRouter',
  },
  {
    model_id: 'cohere/command-r7b-12-2024',
    input_cost_per_token: 3.75e-8,
    output_cost_per_token: 1.5e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'deepcogito/cogito-v2-preview-deepseek-671b',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00000125,
    provider: 'OpenRouter',
  },
  {
    model_id: 'deepcogito/cogito-v2-preview-llama-109b-moe',
    input_cost_per_token: 1.8e-7,
    output_cost_per_token: 5.9e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'deepcogito/cogito-v2-preview-llama-405b',
    input_cost_per_token: 0.0000035,
    output_cost_per_token: 0.0000035,
    provider: 'OpenRouter',
  },
  {
    model_id: 'deepcogito/cogito-v2-preview-llama-70b',
    input_cost_per_token: 8.8e-7,
    output_cost_per_token: 8.8e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'deepseek/deepseek-chat',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 8.5e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'deepseek/deepseek-chat-v3-0324',
    input_cost_per_token: 2.4e-7,
    output_cost_per_token: 8.4e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'deepseek/deepseek-chat-v3.1',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 8e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'deepseek/deepseek-prover-v2',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 0.00000218,
    provider: 'OpenRouter',
  },
  {
    model_id: 'deepseek/deepseek-r1',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.000002,
    provider: 'OpenRouter',
  },
  {
    model_id: 'deepseek/deepseek-r1-0528',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.00000175,
    provider: 'OpenRouter',
  },
  {
    model_id: 'deepseek/deepseek-r1-0528-qwen3-8b',
    input_cost_per_token: 3e-8,
    output_cost_per_token: 1.1e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'deepseek/deepseek-r1-distill-llama-70b',
    input_cost_per_token: 3e-8,
    output_cost_per_token: 1.3e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'deepseek/deepseek-r1-distill-qwen-14b',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 1.5e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'deepseek/deepseek-r1-distill-qwen-32b',
    input_cost_per_token: 2.7e-7,
    output_cost_per_token: 2.7e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'deepseek/deepseek-v3.1-terminus',
    input_cost_per_token: 2.3e-7,
    output_cost_per_token: 9e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'deepseek/deepseek-v3.2-exp',
    input_cost_per_token: 2.7e-7,
    output_cost_per_token: 4e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'eleutherai/llemma_7b',
    input_cost_per_token: 8e-7,
    output_cost_per_token: 0.0000012,
    provider: 'OpenRouter',
  },
  {
    model_id: 'google/gemini-2.0-flash-001',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 4e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'google/gemini-2.0-flash-lite-001',
    input_cost_per_token: 7.5e-8,
    output_cost_per_token: 3e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'google/gemini-2.5-flash',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000025,
    provider: 'OpenRouter',
  },
  {
    model_id: 'google/gemini-2.5-flash-lite',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 4e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'google/gemini-2.5-flash-lite-preview-06-17',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 4e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'google/gemini-2.5-flash-lite-preview-09-2025',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 4e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'google/gemini-2.5-flash-preview-09-2025',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000025,
    provider: 'OpenRouter',
  },
  {
    model_id: 'google/gemini-2.5-pro',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'OpenRouter',
  },
  {
    model_id: 'google/gemini-2.5-pro-preview',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'OpenRouter',
  },
  {
    model_id: 'google/gemini-2.5-pro-preview-05-06',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'OpenRouter',
  },
  {
    model_id: 'google/gemma-2-27b-it',
    input_cost_per_token: 6.5e-7,
    output_cost_per_token: 6.5e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'google/gemma-2-9b-it',
    input_cost_per_token: 1e-8,
    output_cost_per_token: 3e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'google/gemma-3-12b-it',
    input_cost_per_token: 3e-8,
    output_cost_per_token: 1e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'google/gemma-3-27b-it',
    input_cost_per_token: 9e-8,
    output_cost_per_token: 1.6e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'google/gemma-3-4b-it',
    input_cost_per_token: 1.703012e-8,
    output_cost_per_token: 6.81536e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'google/gemma-3n-e4b-it',
    input_cost_per_token: 2e-8,
    output_cost_per_token: 4e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'gryphe/mythomax-l2-13b',
    input_cost_per_token: 5e-8,
    output_cost_per_token: 9e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'inception/mercury',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 0.000001,
    provider: 'OpenRouter',
  },
  {
    model_id: 'inception/mercury-coder',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 0.000001,
    provider: 'OpenRouter',
  },
  {
    model_id: 'inclusionai/ling-1t',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.000002,
    provider: 'OpenRouter',
  },
  {
    model_id: 'inclusionai/ring-1t',
    input_cost_per_token: 5.7e-7,
    output_cost_per_token: 0.00000228,
    provider: 'OpenRouter',
  },
  {
    model_id: 'inflection/inflection-3-pi',
    input_cost_per_token: 0.0000025,
    output_cost_per_token: 0.00001,
    provider: 'OpenRouter',
  },
  {
    model_id: 'inflection/inflection-3-productivity',
    input_cost_per_token: 0.0000025,
    output_cost_per_token: 0.00001,
    provider: 'OpenRouter',
  },
  {
    model_id: 'liquid/lfm-3b',
    input_cost_per_token: 2e-8,
    output_cost_per_token: 2e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'liquid/lfm-7b',
    input_cost_per_token: 1e-8,
    output_cost_per_token: 1e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'mancer/weaver',
    input_cost_per_token: 0.000001125,
    output_cost_per_token: 0.000001125,
    provider: 'OpenRouter',
  },
  {
    model_id: 'meituan/longcat-flash-chat',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 7.5e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'meta-llama/llama-3-70b-instruct',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 4e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'meta-llama/llama-3-8b-instruct',
    input_cost_per_token: 3e-8,
    output_cost_per_token: 6e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'meta-llama/llama-3.1-405b',
    input_cost_per_token: 0.000004,
    output_cost_per_token: 0.000004,
    provider: 'OpenRouter',
  },
  {
    model_id: 'meta-llama/llama-3.1-405b-instruct',
    input_cost_per_token: 8e-7,
    output_cost_per_token: 8e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'meta-llama/llama-3.1-70b-instruct',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 4e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'meta-llama/llama-3.1-8b-instruct',
    input_cost_per_token: 2e-8,
    output_cost_per_token: 3e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'meta-llama/llama-3.2-11b-vision-instruct',
    input_cost_per_token: 4.9e-8,
    output_cost_per_token: 4.9e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'meta-llama/llama-3.2-1b-instruct',
    input_cost_per_token: 5e-9,
    output_cost_per_token: 1e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'meta-llama/llama-3.2-3b-instruct',
    input_cost_per_token: 2e-8,
    output_cost_per_token: 2e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'meta-llama/llama-3.2-90b-vision-instruct',
    input_cost_per_token: 3.5e-7,
    output_cost_per_token: 4e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'meta-llama/llama-3.3-70b-instruct',
    input_cost_per_token: 1.3e-7,
    output_cost_per_token: 3.8e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'meta-llama/llama-4-maverick',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 6e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'meta-llama/llama-4-scout',
    input_cost_per_token: 8e-8,
    output_cost_per_token: 3e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'meta-llama/llama-guard-2-8b',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 2e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'meta-llama/llama-guard-3-8b',
    input_cost_per_token: 2e-8,
    output_cost_per_token: 6e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'meta-llama/llama-guard-4-12b',
    input_cost_per_token: 1.8e-7,
    output_cost_per_token: 1.8e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'microsoft/mai-ds-r1',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000012,
    provider: 'OpenRouter',
  },
  {
    model_id: 'microsoft/phi-3-medium-128k-instruct',
    input_cost_per_token: 0.000001,
    output_cost_per_token: 0.000001,
    provider: 'OpenRouter',
  },
  {
    model_id: 'microsoft/phi-3-mini-128k-instruct',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 1e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'microsoft/phi-3.5-mini-128k-instruct',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 1e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'microsoft/phi-4',
    input_cost_per_token: 6e-8,
    output_cost_per_token: 1.4e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'microsoft/phi-4-multimodal-instruct',
    input_cost_per_token: 5e-8,
    output_cost_per_token: 1e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'microsoft/phi-4-reasoning-plus',
    input_cost_per_token: 7e-8,
    output_cost_per_token: 3.5e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'microsoft/wizardlm-2-8x22b',
    input_cost_per_token: 4.8e-7,
    output_cost_per_token: 4.8e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'minimax/minimax-m1',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.0000022,
    provider: 'OpenRouter',
  },
  {
    model_id: 'mistralai/codestral-2501',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 9e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'mistralai/codestral-2508',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 9e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'mistralai/devstral-medium',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.000002,
    provider: 'OpenRouter',
  },
  {
    model_id: 'mistralai/devstral-small',
    input_cost_per_token: 7e-8,
    output_cost_per_token: 2.8e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'mistralai/devstral-small-2505',
    input_cost_per_token: 5e-8,
    output_cost_per_token: 2.2e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'mistralai/magistral-medium-2506',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000005,
    provider: 'OpenRouter',
  },
  {
    model_id: 'mistralai/magistral-medium-2506:thinking',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000005,
    provider: 'OpenRouter',
  },
  {
    model_id: 'mistralai/magistral-small-2506',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 0.0000015,
    provider: 'OpenRouter',
  },
  {
    model_id: 'mistralai/ministral-3b',
    input_cost_per_token: 4e-8,
    output_cost_per_token: 4e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'mistralai/ministral-8b',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 1e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'mistralai/mistral-7b-instruct',
    input_cost_per_token: 2.8e-8,
    output_cost_per_token: 5.4e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'mistralai/mistral-7b-instruct-v0.1',
    input_cost_per_token: 1.1e-7,
    output_cost_per_token: 1.9e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'mistralai/mistral-7b-instruct-v0.2',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 2e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'mistralai/mistral-7b-instruct-v0.3',
    input_cost_per_token: 2.8e-8,
    output_cost_per_token: 5.4e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'mistralai/mistral-large',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000006,
    provider: 'OpenRouter',
  },
  {
    model_id: 'mistralai/mistral-large-2407',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000006,
    provider: 'OpenRouter',
  },
  {
    model_id: 'mistralai/mistral-large-2411',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000006,
    provider: 'OpenRouter',
  },
  {
    model_id: 'mistralai/mistral-medium-3',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.000002,
    provider: 'OpenRouter',
  },
  {
    model_id: 'mistralai/mistral-medium-3.1',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.000002,
    provider: 'OpenRouter',
  },
  {
    model_id: 'mistralai/mistral-nemo',
    input_cost_per_token: 2e-8,
    output_cost_per_token: 4e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'mistralai/mistral-saba',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 6e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'mistralai/mistral-small',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 6e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'mistralai/mistral-small-24b-instruct-2501',
    input_cost_per_token: 5e-8,
    output_cost_per_token: 8e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'mistralai/mistral-small-3.1-24b-instruct',
    input_cost_per_token: 5e-8,
    output_cost_per_token: 1e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'mistralai/mistral-small-3.2-24b-instruct',
    input_cost_per_token: 6e-8,
    output_cost_per_token: 1.8e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'mistralai/mistral-tiny',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 2.5e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'mistralai/mixtral-8x22b-instruct',
    input_cost_per_token: 9e-7,
    output_cost_per_token: 9e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'mistralai/mixtral-8x7b-instruct',
    input_cost_per_token: 5.4e-7,
    output_cost_per_token: 5.4e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'mistralai/pixtral-12b',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 1e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'mistralai/pixtral-large-2411',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000006,
    provider: 'OpenRouter',
  },
  {
    model_id: 'moonshotai/kimi-dev-72b',
    input_cost_per_token: 2.9e-7,
    output_cost_per_token: 0.00000115,
    provider: 'OpenRouter',
  },
  {
    model_id: 'moonshotai/kimi-k2',
    input_cost_per_token: 1.4e-7,
    output_cost_per_token: 0.00000249,
    provider: 'OpenRouter',
  },
  {
    model_id: 'moonshotai/kimi-k2-0905',
    input_cost_per_token: 3.9e-7,
    output_cost_per_token: 0.0000019,
    provider: 'OpenRouter',
  },
  {
    model_id: 'morph/morph-v3-fast',
    input_cost_per_token: 8e-7,
    output_cost_per_token: 0.0000012,
    provider: 'OpenRouter',
  },
  {
    model_id: 'morph/morph-v3-large',
    input_cost_per_token: 9e-7,
    output_cost_per_token: 0.0000019,
    provider: 'OpenRouter',
  },
  {
    model_id: 'neversleep/llama-3.1-lumimaid-8b',
    input_cost_per_token: 9e-8,
    output_cost_per_token: 6e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'neversleep/noromaid-20b',
    input_cost_per_token: 0.000001,
    output_cost_per_token: 0.00000175,
    provider: 'OpenRouter',
  },
  {
    model_id: 'nousresearch/deephermes-3-llama-3-8b-preview',
    input_cost_per_token: 3e-8,
    output_cost_per_token: 1.1e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'nousresearch/deephermes-3-mistral-24b-preview',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 5.9e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'nousresearch/hermes-2-pro-llama-3-8b',
    input_cost_per_token: 2.5e-8,
    output_cost_per_token: 8e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'nousresearch/hermes-3-llama-3.1-405b',
    input_cost_per_token: 0.000001,
    output_cost_per_token: 0.000001,
    provider: 'OpenRouter',
  },
  {
    model_id: 'nousresearch/hermes-4-405b',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000012,
    provider: 'OpenRouter',
  },
  {
    model_id: 'nousresearch/hermes-4-70b',
    input_cost_per_token: 1.1e-7,
    output_cost_per_token: 3.8e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'nvidia/llama-3.1-nemotron-70b-instruct',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 6e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'nvidia/llama-3.1-nemotron-ultra-253b-v1',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 0.0000018,
    provider: 'OpenRouter',
  },
  {
    model_id: 'nvidia/llama-3.3-nemotron-super-49b-v1.5',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 4e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'nvidia/nemotron-nano-9b-v2',
    input_cost_per_token: 4e-8,
    output_cost_per_token: 1.6e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/chatgpt-4o-latest',
    input_cost_per_token: 0.000005,
    output_cost_per_token: 0.000015,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/codex-mini',
    input_cost_per_token: 0.0000015,
    output_cost_per_token: 0.000006,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/gpt-3.5-turbo',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 0.0000015,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/gpt-3.5-turbo-0613',
    input_cost_per_token: 0.000001,
    output_cost_per_token: 0.000002,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/gpt-3.5-turbo-16k',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000004,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/gpt-3.5-turbo-instruct',
    input_cost_per_token: 0.0000015,
    output_cost_per_token: 0.000002,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/gpt-4',
    input_cost_per_token: 0.00003,
    output_cost_per_token: 0.00006,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/gpt-4-0314',
    input_cost_per_token: 0.00003,
    output_cost_per_token: 0.00006,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/gpt-4-1106-preview',
    input_cost_per_token: 0.00001,
    output_cost_per_token: 0.00003,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/gpt-4-turbo',
    input_cost_per_token: 0.00001,
    output_cost_per_token: 0.00003,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/gpt-4-turbo-preview',
    input_cost_per_token: 0.00001,
    output_cost_per_token: 0.00003,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/gpt-4.1',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000008,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/gpt-4.1-mini',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.0000016,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/gpt-4.1-nano',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 4e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/gpt-4o',
    input_cost_per_token: 0.0000025,
    output_cost_per_token: 0.00001,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/gpt-4o-2024-05-13',
    input_cost_per_token: 0.000005,
    output_cost_per_token: 0.000015,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/gpt-4o-2024-08-06',
    input_cost_per_token: 0.0000025,
    output_cost_per_token: 0.00001,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/gpt-4o-2024-11-20',
    input_cost_per_token: 0.0000025,
    output_cost_per_token: 0.00001,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/gpt-4o-mini',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 6e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/gpt-4o-mini-2024-07-18',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 6e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/gpt-4o-mini-search-preview',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 6e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/gpt-4o-search-preview',
    input_cost_per_token: 0.0000025,
    output_cost_per_token: 0.00001,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/gpt-4o:extended',
    input_cost_per_token: 0.000006,
    output_cost_per_token: 0.000018,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/gpt-5',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/gpt-5-chat',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/gpt-5-codex',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/gpt-5-mini',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 0.000002,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/gpt-5-nano',
    input_cost_per_token: 5e-8,
    output_cost_per_token: 4e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/gpt-5-pro',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.00012,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/gpt-oss-120b',
    input_cost_per_token: 4e-8,
    output_cost_per_token: 4e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/gpt-oss-20b',
    input_cost_per_token: 3e-8,
    output_cost_per_token: 1.4e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/o1',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.00006,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/o1-mini',
    input_cost_per_token: 0.0000011,
    output_cost_per_token: 0.0000044,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/o1-mini-2024-09-12',
    input_cost_per_token: 0.0000011,
    output_cost_per_token: 0.0000044,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/o1-pro',
    input_cost_per_token: 0.00015,
    output_cost_per_token: 0.0006,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/o3',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000008,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/o3-deep-research',
    input_cost_per_token: 0.00001,
    output_cost_per_token: 0.00004,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/o3-mini',
    input_cost_per_token: 0.0000011,
    output_cost_per_token: 0.0000044,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/o3-mini-high',
    input_cost_per_token: 0.0000011,
    output_cost_per_token: 0.0000044,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/o3-pro',
    input_cost_per_token: 0.00002,
    output_cost_per_token: 0.00008,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/o4-mini',
    input_cost_per_token: 0.0000011,
    output_cost_per_token: 0.0000044,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/o4-mini-deep-research',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000008,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/o4-mini-high',
    input_cost_per_token: 0.0000011,
    output_cost_per_token: 0.0000044,
    provider: 'OpenRouter',
  },
  {
    model_id: 'opengvlab/internvl3-78b',
    input_cost_per_token: 7e-8,
    output_cost_per_token: 2.6e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'perplexity/sonar',
    input_cost_per_token: 0.000001,
    output_cost_per_token: 0.000001,
    provider: 'OpenRouter',
  },
  {
    model_id: 'perplexity/sonar-deep-research',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000008,
    provider: 'OpenRouter',
  },
  {
    model_id: 'perplexity/sonar-pro',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'OpenRouter',
  },
  {
    model_id: 'perplexity/sonar-reasoning',
    input_cost_per_token: 0.000001,
    output_cost_per_token: 0.000005,
    provider: 'OpenRouter',
  },
  {
    model_id: 'perplexity/sonar-reasoning-pro',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000008,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen-2.5-72b-instruct',
    input_cost_per_token: 7e-8,
    output_cost_per_token: 2.6e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen-2.5-7b-instruct',
    input_cost_per_token: 4e-8,
    output_cost_per_token: 1e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen-2.5-vl-7b-instruct',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 2e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen-max',
    input_cost_per_token: 0.0000016,
    output_cost_per_token: 0.0000064,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen-plus',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.0000012,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen-plus-2025-07-28',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.0000012,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen-plus-2025-07-28:thinking',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.000004,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen-turbo',
    input_cost_per_token: 5e-8,
    output_cost_per_token: 2e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen-vl-max',
    input_cost_per_token: 8e-7,
    output_cost_per_token: 0.0000032,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen-vl-plus',
    input_cost_per_token: 2.1e-7,
    output_cost_per_token: 6.3e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen2.5-coder-7b-instruct',
    input_cost_per_token: 3e-8,
    output_cost_per_token: 9e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen2.5-vl-32b-instruct',
    input_cost_per_token: 5e-8,
    output_cost_per_token: 2.2e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen2.5-vl-72b-instruct',
    input_cost_per_token: 8e-8,
    output_cost_per_token: 3.3e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen3-14b',
    input_cost_per_token: 5e-8,
    output_cost_per_token: 2.2e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen3-235b-a22b',
    input_cost_per_token: 1.8e-7,
    output_cost_per_token: 5.4e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen3-235b-a22b-2507',
    input_cost_per_token: 8e-8,
    output_cost_per_token: 5.5e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen3-235b-a22b-thinking-2507',
    input_cost_per_token: 1.1e-7,
    output_cost_per_token: 6e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen3-30b-a3b',
    input_cost_per_token: 6e-8,
    output_cost_per_token: 2.2e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen3-30b-a3b-instruct-2507',
    input_cost_per_token: 8e-8,
    output_cost_per_token: 3.3e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen3-30b-a3b-thinking-2507',
    input_cost_per_token: 8e-8,
    output_cost_per_token: 2.9e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen3-32b',
    input_cost_per_token: 5e-8,
    output_cost_per_token: 2e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen3-8b',
    input_cost_per_token: 3.5e-8,
    output_cost_per_token: 1.38e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen3-coder',
    input_cost_per_token: 2.2e-7,
    output_cost_per_token: 9.5e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen3-coder-30b-a3b-instruct',
    input_cost_per_token: 6e-8,
    output_cost_per_token: 2.5e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen3-coder-flash',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000015,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen3-coder-plus',
    input_cost_per_token: 0.000001,
    output_cost_per_token: 0.000005,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen3-max',
    input_cost_per_token: 0.0000012,
    output_cost_per_token: 0.000006,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen3-next-80b-a3b-instruct',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 8e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen3-vl-235b-a22b-instruct',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000012,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen3-vl-235b-a22b-thinking',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000012,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen3-vl-30b-a3b-instruct',
    input_cost_per_token: 2.9e-7,
    output_cost_per_token: 9.9e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen3-vl-30b-a3b-thinking',
    input_cost_per_token: 2.9e-7,
    output_cost_per_token: 0.000001,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen3-vl-8b-instruct',
    input_cost_per_token: 1.8e-7,
    output_cost_per_token: 6.9e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen3-vl-8b-thinking',
    input_cost_per_token: 1.8e-7,
    output_cost_per_token: 0.0000021,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwq-32b',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 4e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'raifle/sorcererlm-8x22b',
    input_cost_per_token: 0.0000045,
    output_cost_per_token: 0.0000045,
    provider: 'OpenRouter',
  },
  {
    model_id: 'sao10k/l3-euryale-70b',
    input_cost_per_token: 0.00000148,
    output_cost_per_token: 0.00000148,
    provider: 'OpenRouter',
  },
  {
    model_id: 'sao10k/l3-lunaris-8b',
    input_cost_per_token: 4e-8,
    output_cost_per_token: 5e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'sao10k/l3.1-70b-hanami-x1',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000003,
    provider: 'OpenRouter',
  },
  {
    model_id: 'sao10k/l3.1-euryale-70b',
    input_cost_per_token: 6.5e-7,
    output_cost_per_token: 7.5e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'sao10k/l3.3-euryale-70b',
    input_cost_per_token: 6.5e-7,
    output_cost_per_token: 7.5e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'shisa-ai/shisa-v2-llama3.3-70b',
    input_cost_per_token: 5e-8,
    output_cost_per_token: 2.2e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'stepfun-ai/step3',
    input_cost_per_token: 5.7e-7,
    output_cost_per_token: 0.00000142,
    provider: 'OpenRouter',
  },
  {
    model_id: 'switchpoint/router',
    input_cost_per_token: 8.5e-7,
    output_cost_per_token: 0.0000034,
    provider: 'OpenRouter',
  },
  {
    model_id: 'tencent/hunyuan-a13b-instruct',
    input_cost_per_token: 3e-8,
    output_cost_per_token: 3e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'thedrummer/anubis-70b-v1.1',
    input_cost_per_token: 6.5e-7,
    output_cost_per_token: 0.000001,
    provider: 'OpenRouter',
  },
  {
    model_id: 'thedrummer/cydonia-24b-v4.1',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 5e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'thedrummer/rocinante-12b',
    input_cost_per_token: 1.7e-7,
    output_cost_per_token: 4.3e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'thedrummer/skyfall-36b-v2',
    input_cost_per_token: 8e-8,
    output_cost_per_token: 3.3e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'thedrummer/unslopnemo-12b',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 4e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'thudm/glm-4.1v-9b-thinking',
    input_cost_per_token: 3.5e-8,
    output_cost_per_token: 1.38e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'thudm/glm-z1-32b',
    input_cost_per_token: 5e-8,
    output_cost_per_token: 2.2e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'tngtech/deepseek-r1t-chimera',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000012,
    provider: 'OpenRouter',
  },
  {
    model_id: 'tngtech/deepseek-r1t2-chimera',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000012,
    provider: 'OpenRouter',
  },
  {
    model_id: 'undi95/remm-slerp-l2-13b',
    input_cost_per_token: 4.5e-7,
    output_cost_per_token: 6.5e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'x-ai/grok-3',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'OpenRouter',
  },
  {
    model_id: 'x-ai/grok-3-beta',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'OpenRouter',
  },
  {
    model_id: 'x-ai/grok-3-mini',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 5e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'x-ai/grok-3-mini-beta',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 5e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'x-ai/grok-4',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'OpenRouter',
  },
  {
    model_id: 'x-ai/grok-4-fast',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 5e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'x-ai/grok-code-fast-1',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 0.0000015,
    provider: 'OpenRouter',
  },
  {
    model_id: 'z-ai/glm-4-32b',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 1e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'z-ai/glm-4.5',
    input_cost_per_token: 3.5e-7,
    output_cost_per_token: 0.00000155,
    provider: 'OpenRouter',
  },
  {
    model_id: 'z-ai/glm-4.5-air',
    input_cost_per_token: 1.4e-7,
    output_cost_per_token: 8.6e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'z-ai/glm-4.5v',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 0.0000018,
    provider: 'OpenRouter',
  },
  {
    model_id: 'z-ai/glm-4.6',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 0.00000175,
    provider: 'OpenRouter',
  },
];
