import { z } from "zod";

// ----- Request schemas -----

// A “Part” in a Content, either text or inline data
const PartRequest = z.union([
  z.object({
    text: z.string(),
  }),
  z.object({
    inlineData: z.object({
      mimeType: z.string().min(1),   // like "image/png"
      data: z.string().min(1),       // base64 string
    }),
  }),
]);

// A “Content” in the “contents” list
const ContentRequest = z.object({
  // optional: in conversational APIs you might include role
  role: z.enum(["user", "assistant", "system"]).optional(),
  parts: z.array(PartRequest).nonempty(),
});

// Optional “generationConfig” section (for structured output, etc.)
const GenerationConfigRequest = z
  .object({
    // e.g. to ask for JSON response
    responseMimeType: z.string().optional(),
    // other config options may exist (temperature, top_p, etc.)
    // we mark these optionally
    temperature: z.number().optional(),
    topP: z.number().optional(),
    // etc.
  })
  .partial();

// Full request body
export const GeminiFlashImageInputSchema = z.object({
  contents: z.array(ContentRequest).nonempty(),
  generationConfig: GenerationConfigRequest.optional(),
});
