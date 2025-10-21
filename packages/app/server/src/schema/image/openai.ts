import { z } from 'zod';

/** Allowed image sizes, per docs */
const ImageSize = z.enum(['256x256', '512x512', '1024x1024']);

/** Allowed response formats */
const ResponseFormat = z.enum(['url', 'b64_json']);

/** Create Images API: request (input) */
export const CreateImagesRequest = z.object({
  prompt: z.string().min(1),
  model: z.enum(['gpt-image-1']),
  n: z.number().int().optional(),
  size: ImageSize.optional(),
  response_format: ResponseFormat.optional(),
  user: z.string().optional(),
});
export type CreateImagesRequest = z.infer<typeof CreateImagesRequest>;

/** Response “data” item when format = url */
const DataUrlItem = z.object({
  url: z.string().url(),
});

/** Response “data” item when format = b64_json */
const DataB64Item = z.object({
  b64_json: z.string().min(1),
});

/** Unified “data” item */
const DataItem = z.union([DataUrlItem, DataB64Item]);

/** Create Images API: response (output) */
export const CreateImagesResponse = z.object({
  created: z.number().int(),
  data: z.array(DataItem).min(1),
});
export type CreateImagesResponse = z.infer<typeof CreateImagesResponse>;
