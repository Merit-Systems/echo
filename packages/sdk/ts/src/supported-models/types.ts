export interface SupportedModel {
  model_id: string;
  input_cost_per_token: number;
  output_cost_per_token: number;
  provider: string;
}

export interface SupportedImageModel {
  model_id: string;
  text_input_cost_per_token: number;
  image_input_cost_per_token: number;
  image_output_cost_per_token: number;
  provider: string;
}

// Tool pricing types
export interface ImageGenerationQualityPricing {
  '1024x1024': number;
  '1024x1536': number;
  '1536x1024': number;
}

export interface ImageGenerationModelPricing {
  low: ImageGenerationQualityPricing;
  medium: ImageGenerationQualityPricing;
  high: ImageGenerationQualityPricing;
}

export interface GeminiImageGenerationPricing {
  cost_per_image: number;
}

export interface ImageGenerationPricing {
  gpt_image_1: ImageGenerationModelPricing;
  gemini_flash_image?: GeminiImageGenerationPricing;
}

export interface CodeInterpreterPricing {
  cost_per_session: number;
}

export interface FileSearchPricing {
  cost_per_call: number;
  storage_cost_per_gb_per_day: number;
  free_storage_gb: number;
}

export interface WebSearchModelPricing {
  cost_per_call: number;
}

export interface WebSearchPricing {
  gpt_4o: WebSearchModelPricing;
  gpt_5: WebSearchModelPricing;
  o_series: WebSearchModelPricing;
}

export interface ToolPricing {
  image_generation: ImageGenerationPricing;
  code_interpreter: CodeInterpreterPricing;
  file_search: FileSearchPricing;
  web_search_preview: WebSearchPricing;
}

// Supported tool types
export type SupportedToolType =
  | 'image_generation'
  | 'code_interpreter'
  | 'file_search'
  | 'web_search_preview';

export type ImageGenerationQuality = 'low' | 'medium' | 'high';
export type ImageDimensions = '1024x1024' | '1024x1536' | '1536x1024';
export type WebSearchModel = 'gpt_4o' | 'gpt_5' | 'o_series';

export interface SupportedTool {
  type: SupportedToolType;
  description: string;
  pricing_structure:
    | 'per_generation'
    | 'per_session'
    | 'per_call'
    | 'per_gb_per_day';
}

export interface SupportedVideoModel {
  model_id: string;
  cost_per_second_with_audio: number;
  cost_per_second_without_audio: number;
  provider: string;
}
