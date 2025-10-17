import { z } from 'zod';

// Input schema
export const TavilyExtractInputSchema = z.object({
  urls: z.union([z.string(), z.array(z.string())]),
  include_images: z.coerce.boolean().optional(),
  include_favicon: z.coerce.boolean().optional(),
  extract_depth: z.enum(['basic', 'advanced']).optional(),
  format: z.enum(['markdown', 'text']).optional(),
  timeout: z.coerce.number().min(1).max(60).optional(),
});

export type TavilyExtractInput = z.infer<typeof TavilyExtractInputSchema>;

// Output schema
export const TavilyExtractResultSchema = z.object({
  url: z.string(),
  raw_content: z.string(),
  images: z.array(z.string()).optional(),
  favicon: z.string().optional(),
});

export const TavilyExtractFailedResultSchema = z.object({
  url: z.string(),
  error: z.string(),
});

export const TavilyExtractOutputSchema = z.object({
  results: z.array(TavilyExtractResultSchema),
  failed_results: z.array(TavilyExtractFailedResultSchema),
  response_time: z.number(),
  request_id: z.string(),
});

export type TavilyExtractOutput = z.infer<typeof TavilyExtractOutputSchema>;
