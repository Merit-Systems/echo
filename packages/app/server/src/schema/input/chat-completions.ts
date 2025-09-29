import { z } from 'zod';
import { ALL_SUPPORTED_MODELS } from 'services/AccountingService';

const ChatMessage = z.object({
    role: z.enum(["system", "user", "assistant", "function"]),
    content: z.string().optional(),
    name: z.string().optional(),        // only used when role = “function” or “assistant” sometimes
    function_call: z
      .object({
        name: z.string(),
        arguments: z.string().optional(),
      })
      .optional(),
  });

export const ChatCompletionInput = z.object({
  model: z.enum(ALL_SUPPORTED_MODELS.map(model => model.model_id) as [string, ...string[]]),
  messages: z.array(ChatMessage),

  // optional parameters
  temperature: z.number().optional(),
  top_p: z.number().optional(),
  n: z.number().optional(),
  stream: z.boolean().optional(),
  stop: z.union([z.string(), z.array(z.string())]).optional(),
  max_tokens: z.number().optional(),
  presence_penalty: z.number().optional(),
  frequency_penalty: z.number().optional(),
  logit_bias: z.record(z.string(), z.number()).optional(),

  // function‐calling / tools (if your implementation supports it)
  functions: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        parameters: z.any(), // leave as any or more specific JSON Schema object
      })
    )
    .optional(),

  function_call: z
    .union([
      z.enum(["none", "auto"]),
      z.object({ name: z.string() }),
    ])
    .optional(),

  // new structured output / response_format
  response_format: z
    .object({
      type: z.enum(["json_schema"]),
      json_schema: z.any(),   // you may replace with a more precise JSON Schema type
    })
    .optional(),
});
