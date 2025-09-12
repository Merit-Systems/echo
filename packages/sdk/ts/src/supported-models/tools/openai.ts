import { SupportedTool, ToolPricing } from '../types';

export type OpenAITool =
  | 'image_generation'
  | 'code_interpreter'
  | 'file_search'
  | 'web_search_preview';

export const OpenAITools: SupportedTool[] = [
  {
    type: 'image_generation',
    description:
      'Generate images using AI models with different quality levels and dimensions',
    pricing_structure: 'per_generation',
  },
  {
    type: 'code_interpreter',
    description: 'Execute Python code in a secure sandbox environment',
    pricing_structure: 'per_session',
  },
  {
    type: 'file_search',
    description:
      'Search and retrieve information from uploaded files with vector embeddings',
    pricing_structure: 'per_call',
  },
  {
    type: 'web_search_preview',
    description: 'Search the web for real-time information (preview feature)',
    pricing_structure: 'per_call',
  },
];

export const DefaultOpenAIToolPricing: ToolPricing = {
  image_generation: {
    gpt_image_1: {
      low: {
        '1024x1024': 0.011,
        '1024x1536': 0.016,
        '1536x1024': 0.016,
      },
      medium: {
        '1024x1024': 0.042,
        '1024x1536': 0.063,
        '1536x1024': 0.063,
      },
      high: {
        '1024x1024': 0.167,
        '1024x1536': 0.25,
        '1536x1024': 0.25,
      },
    },
  },
  code_interpreter: {
    cost_per_session: 0.03,
  },
  file_search: {
    cost_per_call: 0.00125,
    storage_cost_per_gb_per_day: 0.1,
    free_storage_gb: 1,
  },
  web_search_preview: {
    gpt_4o: {
      cost_per_call: 0.025,
    },
    gpt_5: {
      cost_per_call: 0.01,
    },
    o_series: {
      cost_per_call: 0.01,
    },
  },
};
