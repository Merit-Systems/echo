import { z } from "zod";

// Input schema
export const TavilySearchInputSchema = z.object({
    query: z.string(),
    auto_parameters: z.boolean().optional(),
    topic: z.enum(["general", "news"]).optional(),
    search_depth: z.enum(["basic", "advanced"]).optional(),
    chunks_per_source: z.number().int().positive().optional(),
    max_results: z.number().int().positive().optional(),
    time_range: z.string().nullable().optional(),
    days: z.number().int().positive().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    include_answer: z.boolean().optional(),
    include_raw_content: z.boolean().optional(),
    include_images: z.boolean().optional(),
    include_image_descriptions: z.boolean().optional(),
    include_favicon: z.boolean().optional(),
    include_domains: z.array(z.string()).optional(),
    exclude_domains: z.array(z.string()).optional(),
    country: z.string().nullable().optional(),
  });
  
  export type TavilySearchInput = z.infer<typeof TavilySearchInputSchema>;
  
  // Output schema
  export const TavilySearchResultSchema = z.object({
    title: z.string(),
    url: z.string(),
    content: z.string(),
    score: z.number(),
    raw_content: z.string().nullable(),
    favicon: z.string().optional(),
  });
  
  export const TavilySearchOutputSchema = z.object({
    query: z.string(),
    answer: z.string().optional(),
    images: z.array(z.string()),
    results: z.array(TavilySearchResultSchema),
    auto_parameters: z
      .object({
        topic: z.any().optional(),
        search_depth: z.any().optional(),
      })
      .optional(),
    response_time: z.number(),
    request_id: z.string(),
  });
  
  export type TavilySearchOutput = z.infer<typeof TavilySearchOutputSchema>;