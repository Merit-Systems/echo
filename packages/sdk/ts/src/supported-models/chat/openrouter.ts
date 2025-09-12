import { SupportedModel } from '../types';

// Union type of all valid OpenRouter model IDs
export type OpenRouterModel =
  | 'agentica-org/deepcoder-14b-preview'
  | 'agentica-org/deepcoder-14b-preview:free'
  | 'ai21/jamba-large-1.7'
  | 'ai21/jamba-mini-1.7'
  | 'aion-labs/aion-1.0'
  | 'aion-labs/aion-1.0-mini'
  | 'aion-labs/aion-rp-llama-3.1-8b'
  | 'alfredpros/codellama-7b-instruct-solidity'
  | 'alpindale/goliath-120b'
  | 'amazon/nova-lite-v1'
  | 'amazon/nova-micro-v1'
  | 'amazon/nova-pro-v1'
  | 'anthracite-org/magnum-v2-72b'
  | 'anthracite-org/magnum-v4-72b'
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
  | 'arcee-ai/coder-large'
  | 'arcee-ai/maestro-reasoning'
  | 'arcee-ai/spotlight'
  | 'arcee-ai/virtuoso-large'
  | 'arliai/qwq-32b-arliai-rpr-v1'
  | 'arliai/qwq-32b-arliai-rpr-v1:free'
  | 'baidu/ernie-4.5-21b-a3b'
  | 'baidu/ernie-4.5-300b-a47b'
  | 'baidu/ernie-4.5-vl-28b-a3b'
  | 'baidu/ernie-4.5-vl-424b-a47b'
  | 'bytedance/ui-tars-1.5-7b'
  | 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free'
  | 'cognitivecomputations/dolphin-mixtral-8x22b'
  | 'cognitivecomputations/dolphin3.0-mistral-24b'
  | 'cognitivecomputations/dolphin3.0-mistral-24b:free'
  | 'cognitivecomputations/dolphin3.0-r1-mistral-24b'
  | 'cognitivecomputations/dolphin3.0-r1-mistral-24b:free'
  | 'cohere/command'
  | 'cohere/command-a'
  | 'cohere/command-r'
  | 'cohere/command-r-03-2024'
  | 'cohere/command-r-08-2024'
  | 'cohere/command-r-plus'
  | 'cohere/command-r-plus-04-2024'
  | 'cohere/command-r-plus-08-2024'
  | 'cohere/command-r7b-12-2024'
  | 'deepseek/deepseek-chat'
  | 'deepseek/deepseek-chat-v3-0324'
  | 'deepseek/deepseek-chat-v3-0324:free'
  | 'deepseek/deepseek-chat-v3.1'
  | 'deepseek/deepseek-prover-v2'
  | 'deepseek/deepseek-r1'
  | 'deepseek/deepseek-r1-0528'
  | 'deepseek/deepseek-r1-0528-qwen3-8b'
  | 'deepseek/deepseek-r1-0528-qwen3-8b:free'
  | 'deepseek/deepseek-r1-0528:free'
  | 'deepseek/deepseek-r1-distill-llama-70b'
  | 'deepseek/deepseek-r1-distill-llama-70b:free'
  | 'deepseek/deepseek-r1-distill-llama-8b'
  | 'deepseek/deepseek-r1-distill-qwen-1.5b'
  | 'deepseek/deepseek-r1-distill-qwen-14b'
  | 'deepseek/deepseek-r1-distill-qwen-14b:free'
  | 'deepseek/deepseek-r1-distill-qwen-32b'
  | 'deepseek/deepseek-r1:free'
  | 'deepseek/deepseek-v3.1-base'
  | 'eleutherai/llemma_7b'
  | 'google/gemini-2.0-flash-001'
  | 'google/gemini-2.0-flash-exp:free'
  | 'google/gemini-2.0-flash-lite-001'
  | 'google/gemini-2.5-flash'
  | 'google/gemini-2.5-flash-lite'
  | 'google/gemini-2.5-flash-lite-preview-06-17'
  | 'google/gemini-2.5-pro'
  | 'google/gemini-2.5-pro-exp-03-25'
  | 'google/gemini-2.5-pro-preview'
  | 'google/gemini-2.5-pro-preview-05-06'
  | 'google/gemini-flash-1.5'
  | 'google/gemini-flash-1.5-8b'
  | 'google/gemini-pro-1.5'
  | 'google/gemma-2-27b-it'
  | 'google/gemma-2-9b-it'
  | 'google/gemma-2-9b-it:free'
  | 'google/gemma-3-12b-it'
  | 'google/gemma-3-12b-it:free'
  | 'google/gemma-3-27b-it'
  | 'google/gemma-3-27b-it:free'
  | 'google/gemma-3-4b-it'
  | 'google/gemma-3-4b-it:free'
  | 'google/gemma-3n-e2b-it:free'
  | 'google/gemma-3n-e4b-it'
  | 'google/gemma-3n-e4b-it:free'
  | 'gryphe/mythomax-l2-13b'
  | 'inception/mercury'
  | 'inception/mercury-coder'
  | 'infermatic/mn-inferor-12b'
  | 'inflection/inflection-3-pi'
  | 'inflection/inflection-3-productivity'
  | 'liquid/lfm-3b'
  | 'liquid/lfm-7b'
  | 'mancer/weaver'
  | 'meta-llama/llama-3-70b-instruct'
  | 'meta-llama/llama-3-8b-instruct'
  | 'meta-llama/llama-3.1-405b'
  | 'meta-llama/llama-3.1-405b-instruct'
  | 'meta-llama/llama-3.1-405b-instruct:free'
  | 'meta-llama/llama-3.1-70b-instruct'
  | 'meta-llama/llama-3.1-8b-instruct'
  | 'meta-llama/llama-3.2-11b-vision-instruct'
  | 'meta-llama/llama-3.2-11b-vision-instruct:free'
  | 'meta-llama/llama-3.2-1b-instruct'
  | 'meta-llama/llama-3.2-3b-instruct'
  | 'meta-llama/llama-3.2-3b-instruct:free'
  | 'meta-llama/llama-3.2-90b-vision-instruct'
  | 'meta-llama/llama-3.3-70b-instruct'
  | 'meta-llama/llama-3.3-70b-instruct:free'
  | 'meta-llama/llama-3.3-8b-instruct:free'
  | 'meta-llama/llama-4-maverick'
  | 'meta-llama/llama-4-maverick:free'
  | 'meta-llama/llama-4-scout'
  | 'meta-llama/llama-4-scout:free'
  | 'meta-llama/llama-guard-2-8b'
  | 'meta-llama/llama-guard-3-8b'
  | 'meta-llama/llama-guard-4-12b'
  | 'microsoft/mai-ds-r1'
  | 'microsoft/mai-ds-r1:free'
  | 'microsoft/phi-3-medium-128k-instruct'
  | 'microsoft/phi-3-mini-128k-instruct'
  | 'microsoft/phi-3.5-mini-128k-instruct'
  | 'microsoft/phi-4'
  | 'microsoft/phi-4-multimodal-instruct'
  | 'microsoft/phi-4-reasoning-plus'
  | 'microsoft/wizardlm-2-8x22b'
  | 'minimax/minimax-01'
  | 'minimax/minimax-m1'
  | 'mistralai/codestral-2501'
  | 'mistralai/codestral-2508'
  | 'mistralai/devstral-medium'
  | 'mistralai/devstral-small'
  | 'mistralai/devstral-small-2505'
  | 'mistralai/devstral-small-2505:free'
  | 'mistralai/magistral-medium-2506'
  | 'mistralai/magistral-medium-2506:thinking'
  | 'mistralai/magistral-small-2506'
  | 'mistralai/ministral-3b'
  | 'mistralai/ministral-8b'
  | 'mistralai/mistral-7b-instruct'
  | 'mistralai/mistral-7b-instruct-v0.1'
  | 'mistralai/mistral-7b-instruct-v0.3'
  | 'mistralai/mistral-7b-instruct:free'
  | 'mistralai/mistral-large'
  | 'mistralai/mistral-large-2407'
  | 'mistralai/mistral-large-2411'
  | 'mistralai/mistral-medium-3'
  | 'mistralai/mistral-medium-3.1'
  | 'mistralai/mistral-nemo'
  | 'mistralai/mistral-nemo:free'
  | 'mistralai/mistral-saba'
  | 'mistralai/mistral-small'
  | 'mistralai/mistral-small-24b-instruct-2501'
  | 'mistralai/mistral-small-24b-instruct-2501:free'
  | 'mistralai/mistral-small-3.1-24b-instruct'
  | 'mistralai/mistral-small-3.1-24b-instruct:free'
  | 'mistralai/mistral-small-3.2-24b-instruct'
  | 'mistralai/mistral-small-3.2-24b-instruct:free'
  | 'mistralai/mistral-tiny'
  | 'mistralai/mixtral-8x22b-instruct'
  | 'mistralai/mixtral-8x7b-instruct'
  | 'mistralai/pixtral-12b'
  | 'mistralai/pixtral-large-2411'
  | 'moonshotai/kimi-dev-72b:free'
  | 'moonshotai/kimi-k2'
  | 'moonshotai/kimi-k2:free'
  | 'moonshotai/kimi-vl-a3b-thinking'
  | 'moonshotai/kimi-vl-a3b-thinking:free'
  | 'morph/morph-v3-fast'
  | 'morph/morph-v3-large'
  | 'neversleep/llama-3-lumimaid-70b'
  | 'neversleep/llama-3.1-lumimaid-8b'
  | 'neversleep/noromaid-20b'
  | 'nousresearch/deephermes-3-llama-3-8b-preview:free'
  | 'nousresearch/deephermes-3-mistral-24b-preview'
  | 'nousresearch/hermes-2-pro-llama-3-8b'
  | 'nousresearch/hermes-3-llama-3.1-405b'
  | 'nousresearch/hermes-3-llama-3.1-70b'
  | 'nousresearch/hermes-4-405b'
  | 'nousresearch/hermes-4-70b'
  | 'nousresearch/nous-hermes-2-mixtral-8x7b-dpo'
  | 'nvidia/llama-3.1-nemotron-70b-instruct'
  | 'nvidia/llama-3.1-nemotron-ultra-253b-v1'
  | 'nvidia/llama-3.1-nemotron-ultra-253b-v1:free'
  | 'nvidia/llama-3.3-nemotron-super-49b-v1'
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
  | 'openai/gpt-4o-audio-preview'
  | 'openai/gpt-4o-mini'
  | 'openai/gpt-4o-mini-2024-07-18'
  | 'openai/gpt-4o-mini-search-preview'
  | 'openai/gpt-4o-search-preview'
  | 'openai/gpt-4o:extended'
  | 'openai/gpt-5'
  | 'openai/gpt-5-chat'
  | 'openai/gpt-5-mini'
  | 'openai/gpt-5-nano'
  | 'openai/gpt-oss-120b'
  | 'openai/gpt-oss-20b'
  | 'openai/gpt-oss-20b:free'
  | 'openai/o1'
  | 'openai/o1-mini'
  | 'openai/o1-mini-2024-09-12'
  | 'openai/o1-pro'
  | 'openai/o3'
  | 'openai/o3-mini'
  | 'openai/o3-mini-high'
  | 'openai/o3-pro'
  | 'openai/o4-mini'
  | 'openai/o4-mini-high'
  | 'opengvlab/internvl3-14b'
  | 'openrouter/auto'
  | 'perplexity/r1-1776'
  | 'perplexity/sonar'
  | 'perplexity/sonar-deep-research'
  | 'perplexity/sonar-pro'
  | 'perplexity/sonar-reasoning'
  | 'perplexity/sonar-reasoning-pro'
  | 'pygmalionai/mythalion-13b'
  | 'qwen/qwen-2-72b-instruct'
  | 'qwen/qwen-2.5-72b-instruct'
  | 'qwen/qwen-2.5-72b-instruct:free'
  | 'qwen/qwen-2.5-7b-instruct'
  | 'qwen/qwen-2.5-coder-32b-instruct'
  | 'qwen/qwen-2.5-coder-32b-instruct:free'
  | 'qwen/qwen-2.5-vl-7b-instruct'
  | 'qwen/qwen-max'
  | 'qwen/qwen-plus'
  | 'qwen/qwen-turbo'
  | 'qwen/qwen-vl-max'
  | 'qwen/qwen-vl-plus'
  | 'qwen/qwen2.5-vl-32b-instruct'
  | 'qwen/qwen2.5-vl-32b-instruct:free'
  | 'qwen/qwen2.5-vl-72b-instruct'
  | 'qwen/qwen2.5-vl-72b-instruct:free'
  | 'qwen/qwen3-14b'
  | 'qwen/qwen3-14b:free'
  | 'qwen/qwen3-235b-a22b'
  | 'qwen/qwen3-235b-a22b-2507'
  | 'qwen/qwen3-235b-a22b-thinking-2507'
  | 'qwen/qwen3-235b-a22b:free'
  | 'qwen/qwen3-30b-a3b'
  | 'qwen/qwen3-30b-a3b-instruct-2507'
  | 'qwen/qwen3-30b-a3b:free'
  | 'qwen/qwen3-32b'
  | 'qwen/qwen3-4b:free'
  | 'qwen/qwen3-8b'
  | 'qwen/qwen3-8b:free'
  | 'qwen/qwen3-coder'
  | 'qwen/qwen3-coder:free'
  | 'qwen/qwq-32b'
  | 'qwen/qwq-32b-preview'
  | 'qwen/qwq-32b:free'
  | 'raifle/sorcererlm-8x22b'
  | 'rekaai/reka-flash-3:free'
  | 'sao10k/l3-euryale-70b'
  | 'sao10k/l3-lunaris-8b'
  | 'sao10k/l3.1-euryale-70b'
  | 'sao10k/l3.3-euryale-70b'
  | 'sarvamai/sarvam-m:free'
  | 'scb10x/llama3.1-typhoon2-70b-instruct'
  | 'shisa-ai/shisa-v2-llama3.3-70b'
  | 'shisa-ai/shisa-v2-llama3.3-70b:free'
  | 'sophosympatheia/midnight-rose-70b'
  | 'switchpoint/router'
  | 'tencent/hunyuan-a13b-instruct'
  | 'tencent/hunyuan-a13b-instruct:free'
  | 'thedrummer/anubis-70b-v1.1'
  | 'thedrummer/anubis-pro-105b-v1'
  | 'thedrummer/rocinante-12b'
  | 'thedrummer/skyfall-36b-v2'
  | 'thedrummer/unslopnemo-12b'
  | 'thudm/glm-4-32b'
  | 'thudm/glm-4.1v-9b-thinking'
  | 'thudm/glm-z1-32b'
  | 'tngtech/deepseek-r1t-chimera'
  | 'tngtech/deepseek-r1t-chimera:free'
  | 'tngtech/deepseek-r1t2-chimera:free'
  | 'undi95/remm-slerp-l2-13b'
  | 'x-ai/grok-2-1212'
  | 'x-ai/grok-2-vision-1212'
  | 'x-ai/grok-3'
  | 'x-ai/grok-3-beta'
  | 'x-ai/grok-3-mini'
  | 'x-ai/grok-3-mini-beta'
  | 'x-ai/grok-4'
  | 'x-ai/grok-code-fast-1'
  | 'x-ai/grok-vision-beta'
  | 'z-ai/glm-4-32b'
  | 'z-ai/glm-4.5'
  | 'z-ai/glm-4.5-air'
  | 'z-ai/glm-4.5-air:free'
  | 'z-ai/glm-4.5v';

export const OpenRouterModels: SupportedModel[] = [
  {
    model_id: 'agentica-org/deepcoder-14b-preview',
    input_cost_per_token: 1.5e-8,
    output_cost_per_token: 1.5e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'agentica-org/deepcoder-14b-preview:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
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
    input_cost_per_token: 7e-7,
    output_cost_per_token: 0.0000011,
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
    model_id: 'anthracite-org/magnum-v2-72b',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000003,
    provider: 'OpenRouter',
  },
  {
    model_id: 'anthracite-org/magnum-v4-72b',
    input_cost_per_token: 0.000002,
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
    model_id: 'anthropic/claude-3.5-haiku-20241022',
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
    model_id: 'arcee-ai/spotlight',
    input_cost_per_token: 1.8e-7,
    output_cost_per_token: 1.8e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'arcee-ai/virtuoso-large',
    input_cost_per_token: 7.5e-7,
    output_cost_per_token: 0.0000012,
    provider: 'OpenRouter',
  },
  {
    model_id: 'arliai/qwq-32b-arliai-rpr-v1',
    input_cost_per_token: 1e-8,
    output_cost_per_token: 4.00032e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'arliai/qwq-32b-arliai-rpr-v1:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'baidu/ernie-4.5-21b-a3b',
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
    model_id: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'cognitivecomputations/dolphin-mixtral-8x22b',
    input_cost_per_token: 9e-7,
    output_cost_per_token: 9e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'cognitivecomputations/dolphin3.0-mistral-24b',
    input_cost_per_token: 3.7022e-8,
    output_cost_per_token: 1.4816e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'cognitivecomputations/dolphin3.0-mistral-24b:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'cognitivecomputations/dolphin3.0-r1-mistral-24b',
    input_cost_per_token: 1e-8,
    output_cost_per_token: 3.40768e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'cognitivecomputations/dolphin3.0-r1-mistral-24b:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'cohere/command',
    input_cost_per_token: 0.000001,
    output_cost_per_token: 0.000002,
    provider: 'OpenRouter',
  },
  {
    model_id: 'cohere/command-a',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000008,
    provider: 'OpenRouter',
  },
  {
    model_id: 'cohere/command-r',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 0.0000015,
    provider: 'OpenRouter',
  },
  {
    model_id: 'cohere/command-r-03-2024',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 0.0000015,
    provider: 'OpenRouter',
  },
  {
    model_id: 'cohere/command-r-08-2024',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 6e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'cohere/command-r-plus',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'OpenRouter',
  },
  {
    model_id: 'cohere/command-r-plus-04-2024',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
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
    model_id: 'deepseek/deepseek-chat',
    input_cost_per_token: 1.999188e-7,
    output_cost_per_token: 8.00064e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'deepseek/deepseek-chat-v3-0324',
    input_cost_per_token: 1.999188e-7,
    output_cost_per_token: 8.00064e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'deepseek/deepseek-chat-v3-0324:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
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
    input_cost_per_token: 1.999188e-7,
    output_cost_per_token: 8.00064e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'deepseek/deepseek-r1-0528-qwen3-8b',
    input_cost_per_token: 1e-8,
    output_cost_per_token: 2e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'deepseek/deepseek-r1-0528:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'deepseek/deepseek-r1-distill-llama-70b',
    input_cost_per_token: 2.59154e-8,
    output_cost_per_token: 1.03712e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'deepseek/deepseek-r1-distill-llama-70b:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'deepseek/deepseek-r1-distill-llama-8b',
    input_cost_per_token: 4e-8,
    output_cost_per_token: 4e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'deepseek/deepseek-r1-distill-qwen-1.5b',
    input_cost_per_token: 1.8e-7,
    output_cost_per_token: 1.8e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'deepseek/deepseek-r1-distill-qwen-14b',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 1.5e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'deepseek/deepseek-r1-distill-qwen-14b:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'deepseek/deepseek-r1-distill-qwen-32b',
    input_cost_per_token: 7.5e-8,
    output_cost_per_token: 1.5e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'deepseek/deepseek-r1:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'deepseek/deepseek-v3.1-base',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 8e-7,
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
    model_id: 'google/gemini-2.0-flash-exp:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
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
    model_id: 'google/gemini-2.5-pro',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'OpenRouter',
  },
  {
    model_id: 'google/gemini-2.5-pro-exp-03-25',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
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
    model_id: 'google/gemini-flash-1.5',
    input_cost_per_token: 7.5e-8,
    output_cost_per_token: 3e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'google/gemini-flash-1.5-8b',
    input_cost_per_token: 3.75e-8,
    output_cost_per_token: 1.5e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'google/gemini-pro-1.5',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.000005,
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
    output_cost_per_token: 1.00008e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'google/gemma-2-9b-it:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'google/gemma-3-12b-it',
    input_cost_per_token: 4.81286e-8,
    output_cost_per_token: 1.92608e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'google/gemma-3-12b-it:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'google/gemma-3-27b-it',
    input_cost_per_token: 6.66396e-8,
    output_cost_per_token: 2.66688e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'google/gemma-3-27b-it:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'google/gemma-3-4b-it',
    input_cost_per_token: 2e-8,
    output_cost_per_token: 4e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'google/gemma-3-4b-it:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'google/gemma-3n-e2b-it:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'google/gemma-3n-e4b-it',
    input_cost_per_token: 2e-8,
    output_cost_per_token: 4e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'google/gemma-3n-e4b-it:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'gryphe/mythomax-l2-13b',
    input_cost_per_token: 6e-8,
    output_cost_per_token: 6e-8,
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
    model_id: 'infermatic/mn-inferor-12b',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 0.000001,
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
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000002,
    provider: 'OpenRouter',
  },
  {
    model_id: 'meta-llama/llama-3.1-405b-instruct',
    input_cost_per_token: 8e-7,
    output_cost_per_token: 8e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'meta-llama/llama-3.1-405b-instruct:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'meta-llama/llama-3.1-70b-instruct',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 2.8e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'meta-llama/llama-3.1-8b-instruct',
    input_cost_per_token: 1.5e-8,
    output_cost_per_token: 2e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'meta-llama/llama-3.2-11b-vision-instruct',
    input_cost_per_token: 4.9e-8,
    output_cost_per_token: 4.9e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'meta-llama/llama-3.2-11b-vision-instruct:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
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
    input_cost_per_token: 3e-9,
    output_cost_per_token: 6e-9,
    provider: 'OpenRouter',
  },
  {
    model_id: 'meta-llama/llama-3.2-3b-instruct:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'meta-llama/llama-3.2-90b-vision-instruct',
    input_cost_per_token: 0.0000012,
    output_cost_per_token: 0.0000012,
    provider: 'OpenRouter',
  },
  {
    model_id: 'meta-llama/llama-3.3-70b-instruct',
    input_cost_per_token: 3.8e-8,
    output_cost_per_token: 1.2e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'meta-llama/llama-3.3-70b-instruct:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'meta-llama/llama-3.3-8b-instruct:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'meta-llama/llama-4-maverick',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 6e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'meta-llama/llama-4-maverick:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'meta-llama/llama-4-scout',
    input_cost_per_token: 8e-8,
    output_cost_per_token: 3e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'meta-llama/llama-4-scout:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
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
    input_cost_per_token: 1.999188e-7,
    output_cost_per_token: 8.00064e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'microsoft/mai-ds-r1:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
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
    model_id: 'minimax/minimax-01',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 0.0000011,
    provider: 'OpenRouter',
  },
  {
    model_id: 'minimax/minimax-m1',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.00000165,
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
    input_cost_per_token: 1.999188e-8,
    output_cost_per_token: 8.00064e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'mistralai/devstral-small-2505:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
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
    model_id: 'mistralai/mistral-7b-instruct-v0.3',
    input_cost_per_token: 2.8e-8,
    output_cost_per_token: 5.4e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'mistralai/mistral-7b-instruct:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
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
    input_cost_per_token: 7.5e-9,
    output_cost_per_token: 5e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'mistralai/mistral-nemo:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
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
    input_cost_per_token: 1.999188e-8,
    output_cost_per_token: 8.00064e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'mistralai/mistral-small-24b-instruct-2501:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'mistralai/mistral-small-3.1-24b-instruct',
    input_cost_per_token: 1.999188e-8,
    output_cost_per_token: 8.00064e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'mistralai/mistral-small-3.1-24b-instruct:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'mistralai/mistral-small-3.2-24b-instruct',
    input_cost_per_token: 5e-8,
    output_cost_per_token: 1e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'mistralai/mistral-small-3.2-24b-instruct:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
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
    input_cost_per_token: 8e-8,
    output_cost_per_token: 2.4e-7,
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
    model_id: 'moonshotai/kimi-dev-72b:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'moonshotai/kimi-k2',
    input_cost_per_token: 1.4e-7,
    output_cost_per_token: 0.00000249,
    provider: 'OpenRouter',
  },
  {
    model_id: 'moonshotai/kimi-k2:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'moonshotai/kimi-vl-a3b-thinking',
    input_cost_per_token: 2.498985e-8,
    output_cost_per_token: 1.00008e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'moonshotai/kimi-vl-a3b-thinking:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'morph/morph-v3-fast',
    input_cost_per_token: 9e-7,
    output_cost_per_token: 0.0000019,
    provider: 'OpenRouter',
  },
  {
    model_id: 'morph/morph-v3-large',
    input_cost_per_token: 9e-7,
    output_cost_per_token: 0.0000019,
    provider: 'OpenRouter',
  },
  {
    model_id: 'neversleep/llama-3-lumimaid-70b',
    input_cost_per_token: 0.000004,
    output_cost_per_token: 0.000006,
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
    model_id: 'nousresearch/deephermes-3-llama-3-8b-preview:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'nousresearch/deephermes-3-mistral-24b-preview',
    input_cost_per_token: 9.329544e-8,
    output_cost_per_token: 3.733632e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'nousresearch/hermes-2-pro-llama-3-8b',
    input_cost_per_token: 2.5e-8,
    output_cost_per_token: 4e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'nousresearch/hermes-3-llama-3.1-405b',
    input_cost_per_token: 7e-7,
    output_cost_per_token: 8e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'nousresearch/hermes-3-llama-3.1-70b',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 2.8e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'nousresearch/hermes-4-405b',
    input_cost_per_token: 0.000001,
    output_cost_per_token: 0.000003,
    provider: 'OpenRouter',
  },
  {
    model_id: 'nousresearch/hermes-4-70b',
    input_cost_per_token: 1.3e-7,
    output_cost_per_token: 4e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'nousresearch/nous-hermes-2-mixtral-8x7b-dpo',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 6e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'nvidia/llama-3.1-nemotron-70b-instruct',
    input_cost_per_token: 1.2e-7,
    output_cost_per_token: 3e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'nvidia/llama-3.1-nemotron-ultra-253b-v1',
    input_cost_per_token: 6e-7,
    output_cost_per_token: 0.0000018,
    provider: 'OpenRouter',
  },
  {
    model_id: 'nvidia/llama-3.1-nemotron-ultra-253b-v1:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'nvidia/llama-3.3-nemotron-super-49b-v1',
    input_cost_per_token: 1.3e-7,
    output_cost_per_token: 4e-7,
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
    model_id: 'openai/gpt-4o-audio-preview',
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
    model_id: 'openai/gpt-oss-120b',
    input_cost_per_token: 7.2e-8,
    output_cost_per_token: 2.8e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/gpt-oss-20b',
    input_cost_per_token: 4e-8,
    output_cost_per_token: 1.5e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openai/gpt-oss-20b:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
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
    model_id: 'openai/o4-mini-high',
    input_cost_per_token: 0.0000011,
    output_cost_per_token: 0.0000044,
    provider: 'OpenRouter',
  },
  {
    model_id: 'opengvlab/internvl3-14b',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 4e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'openrouter/auto',
    input_cost_per_token: -1,
    output_cost_per_token: -1,
    provider: 'OpenRouter',
  },
  {
    model_id: 'perplexity/r1-1776',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000008,
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
    model_id: 'pygmalionai/mythalion-13b',
    input_cost_per_token: 7e-7,
    output_cost_per_token: 0.0000011,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen-2-72b-instruct',
    input_cost_per_token: 9e-7,
    output_cost_per_token: 9e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen-2.5-72b-instruct',
    input_cost_per_token: 5.18308e-8,
    output_cost_per_token: 2.07424e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen-2.5-72b-instruct:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen-2.5-7b-instruct',
    input_cost_per_token: 4e-8,
    output_cost_per_token: 1e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen-2.5-coder-32b-instruct',
    input_cost_per_token: 4.99797e-8,
    output_cost_per_token: 2.00016e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen-2.5-coder-32b-instruct:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
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
    model_id: 'qwen/qwen2.5-vl-32b-instruct',
    input_cost_per_token: 1.999188e-8,
    output_cost_per_token: 8.00064e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen2.5-vl-32b-instruct:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen2.5-vl-72b-instruct',
    input_cost_per_token: 9.99594e-8,
    output_cost_per_token: 4.00032e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen2.5-vl-72b-instruct:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen3-14b',
    input_cost_per_token: 6e-8,
    output_cost_per_token: 2.4e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen3-14b:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen3-235b-a22b',
    input_cost_per_token: 1.3e-7,
    output_cost_per_token: 6e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen3-235b-a22b-2507',
    input_cost_per_token: 7.7968332e-8,
    output_cost_per_token: 3.1202496e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen3-235b-a22b-thinking-2507',
    input_cost_per_token: 7.7968332e-8,
    output_cost_per_token: 3.1202496e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen3-235b-a22b:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen3-30b-a3b',
    input_cost_per_token: 1.999188e-8,
    output_cost_per_token: 8.00064e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen3-30b-a3b-instruct-2507',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 3e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen3-30b-a3b:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen3-32b',
    input_cost_per_token: 1.7992692e-8,
    output_cost_per_token: 7.200576e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen3-4b:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen3-8b',
    input_cost_per_token: 3.5e-8,
    output_cost_per_token: 1.38e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen3-8b:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen3-coder',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 8e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwen3-coder:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwq-32b',
    input_cost_per_token: 7.5e-8,
    output_cost_per_token: 1.5e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwq-32b-preview',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 2e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'qwen/qwq-32b:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'raifle/sorcererlm-8x22b',
    input_cost_per_token: 0.0000045,
    output_cost_per_token: 0.0000045,
    provider: 'OpenRouter',
  },
  {
    model_id: 'rekaai/reka-flash-3:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
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
    input_cost_per_token: 2e-8,
    output_cost_per_token: 5e-8,
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
    model_id: 'sarvamai/sarvam-m:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'scb10x/llama3.1-typhoon2-70b-instruct',
    input_cost_per_token: 8.8e-7,
    output_cost_per_token: 8.8e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'shisa-ai/shisa-v2-llama3.3-70b',
    input_cost_per_token: 1.999188e-8,
    output_cost_per_token: 8.00064e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'shisa-ai/shisa-v2-llama3.3-70b:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'sophosympatheia/midnight-rose-70b',
    input_cost_per_token: 8e-7,
    output_cost_per_token: 8e-7,
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
    model_id: 'tencent/hunyuan-a13b-instruct:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'thedrummer/anubis-70b-v1.1',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 7e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'thedrummer/anubis-pro-105b-v1',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 0.000001,
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
    input_cost_per_token: 4.81286e-8,
    output_cost_per_token: 1.92608e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'thedrummer/unslopnemo-12b',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 4e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'thudm/glm-4-32b',
    input_cost_per_token: 5.5e-7,
    output_cost_per_token: 0.00000166,
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
    input_cost_per_token: 1.999188e-8,
    output_cost_per_token: 8.00064e-8,
    provider: 'OpenRouter',
  },
  {
    model_id: 'tngtech/deepseek-r1t-chimera',
    input_cost_per_token: 1.999188e-7,
    output_cost_per_token: 8.00064e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'tngtech/deepseek-r1t-chimera:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'tngtech/deepseek-r1t2-chimera:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'undi95/remm-slerp-l2-13b',
    input_cost_per_token: 4.5e-7,
    output_cost_per_token: 6.5e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'x-ai/grok-2-1212',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.00001,
    provider: 'OpenRouter',
  },
  {
    model_id: 'x-ai/grok-2-vision-1212',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.00001,
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
    model_id: 'x-ai/grok-code-fast-1',
    input_cost_per_token: 0.0000002,
    output_cost_per_token: 0.0000015,
    provider: 'OpenRouter',
  },
  {
    model_id: 'x-ai/grok-vision-beta',
    input_cost_per_token: 0.000005,
    output_cost_per_token: 0.000015,
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
    input_cost_per_token: 1.999188e-7,
    output_cost_per_token: 8.00064e-7,
    provider: 'OpenRouter',
  },
  {
    model_id: 'z-ai/glm-4.5-air',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 0.0000011,
    provider: 'OpenRouter',
  },
  {
    model_id: 'z-ai/glm-4.5-air:free',
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    provider: 'OpenRouter',
  },
  {
    model_id: 'z-ai/glm-4.5v',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 0.0000018,
    provider: 'OpenRouter',
  },
];
