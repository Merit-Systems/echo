// Types for Supported Models feature

export interface SupportedModel {
  name: string; // The model key (e.g., "gpt-4", "claude-3-sonnet")
  display_name: string; // The friendly display name
  description: string | null;
  provider: string; // The provider ID (e.g., "openai", "anthropic")
  pricing: {
    input_cost_per_token: number | null;
    output_cost_per_token: number | null;
  };
}

export interface SupportedModelsResult {
  models: SupportedModel[];
  models_by_provider: Record<string, SupportedModel[]>;
}
