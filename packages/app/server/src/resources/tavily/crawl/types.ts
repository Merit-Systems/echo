import { z } from 'zod';

// Input schema
export const TavilyCrawlInputSchema = z.object({
  url: z.string(),
  instructions: z.string().optional(),
  max_depth: z.coerce.number().int().min(1).optional(),
  max_breadth: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).optional(),
  select_paths: z.array(z.string()).nullable().optional(),
  select_domains: z.array(z.string()).nullable().optional(),
  exclude_paths: z.array(z.string()).nullable().optional(),
  exclude_domains: z.array(z.string()).nullable().optional(),
  allow_external: z.coerce.boolean().optional(),
  include_images: z.coerce.boolean().optional(),
  extract_depth: z.enum(['basic', 'advanced']).optional(),
  format: z.enum(['markdown', 'text']).optional(),
  include_favicon: z.coerce.boolean().optional(),
});

export type TavilyCrawlInput = z.infer<typeof TavilyCrawlInputSchema>;

// Output schema
export const TavilyCrawlResultSchema = z.object({
  url: z.string(),
  raw_content: z.string().nullable(),
  favicon: z.string().optional(),
});

export const TavilyCrawlOutputSchema = z.object({
  base_url: z.string(),
  results: z.array(TavilyCrawlResultSchema),
  response_time: z.number(),
  request_id: z.string(),
});

export type TavilyCrawlOutput = z.infer<typeof TavilyCrawlOutputSchema>;
