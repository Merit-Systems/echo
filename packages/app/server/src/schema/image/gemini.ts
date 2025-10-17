import { z } from 'zod';

// ----- Request schemas -----

// A “Part” in a Content, either text or inline data
const PartRequest = z.union([
  z.object({
    text: z.string(),
  }),
  z.object({
    inlineData: z.object({
      mimeType: z.string().min(1), // like "image/png"
      data: z.string().min(1), // base64 string
    }),
  }),
]);

// A “Content” in the “contents” list
const ContentRequest = z.object({
  // optional: in conversational APIs you might include role
  role: z.enum(['user', 'assistant', 'system']).optional(),
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

// A “Part” in the response
const PartResponse = z.union([
  z.object({
    text: z.string().optional(), // might or might not include text
  }),
  z.object({
    inlineData: z.object({
      mimeType: z.string().optional(),
      data: z.string(), // base64-encoded data
    }),
  }),
]);

const ContentResponse = z.object({
  parts: z.array(PartResponse).nonempty(),
});

// A “Candidate” (one possible completed content)
const CandidateResponse = z.object({
  content: ContentResponse,
});

// Metadata and auxiliary fields in the response
const PromptFeedback = z
  .object({
    blockReason: z.string().optional(),
    safetyRatings: z.array(z.object({})).optional(), // you can expand if you know structure
    blockReasonMessage: z.string().optional(),
  })
  .partial(); // may or may not appear

const UsageMetadata = z
  .object({
    promptTokenCount: z.number().optional(),
    candidatesTokenCount: z.number().optional(),
    totalTokenCount: z.number().optional(),
    // other usage fields could go here
  })
  .partial();

// Full response body
export const GeminiFlashImageOutputSchema = z.object({
  candidates: z.array(CandidateResponse).nonempty(),
  promptFeedback: PromptFeedback.optional(),
  usageMetadata: UsageMetadata.optional(),
  // add fields from GenerateContentResponse spec if needed (timestamps, etc.)
  // e.g. createTime, etc.
  createTime: z.string().optional(),
});
