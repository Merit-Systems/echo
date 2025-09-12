import { OpenAIModels } from '../chat/openai';
import { SupportedModel, SupportedTool, ToolPricing } from '../types';
import { DefaultOpenAIToolPricing, OpenAITools } from '../tools/openai';

export const SupportedOpenAIResponseModels: SupportedModel[] = OpenAIModels;

export const SupportedOpenAIResponseTools: SupportedTool[] = OpenAITools;

export const SupportedOpenAIResponseToolPricing: ToolPricing =
  DefaultOpenAIToolPricing;
