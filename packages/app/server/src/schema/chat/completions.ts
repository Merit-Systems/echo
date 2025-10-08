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

// The content of each message can be a simple string or more structured parts
const ChatMessageContentPart = z.object({
  type: z.string(), // e.g. "text"
  text: z.string().optional(),
  // could be expanded to include "image_url", "refusal", etc. in newer models
});

const ChatMessageOutput = z.object({
  role: z.enum(["system", "user", "assistant", "function"]),
  content: z.union([z.string(), z.array(ChatMessageContentPart)]).nullable(),
  name: z.string().optional(),
  function_call: z
    .object({
      name: z.string(),
      arguments: z.string(),
    })
    .optional(),
  tool_calls: z
    .array(
      z.object({
        id: z.string(),
        type: z.enum(["function"]),
        function: z.object({
          name: z.string(),
          arguments: z.string(),
        }),
      })
    )
    .optional(),
});

// Each choice returned
const ChatCompletionChoice = z.object({
  index: z.number(),
  message: ChatMessageOutput,
  finish_reason: z.enum(["stop", "length", "tool_calls", "content_filter", "function_call"]).nullable(),
  logprobs: z
    .object({
      content: z
        .array(
          z.object({
            token: z.string(),
            logprob: z.number(),
            bytes: z.array(z.number()).nullable(),
            top_logprobs: z
              .array(
                z.object({
                  token: z.string(),
                  logprob: z.number(),
                  bytes: z.array(z.number()).nullable(),
                })
              )
              .optional(),
          })
        )
        .nullable(),
    })
    .nullable()
    .optional(),
});

// The full response object
export const ChatCompletionOutput = z.object({
  id: z.string(),
  object: z.literal("chat.completion"),
  created: z.number(),
  model: z.string(),
  choices: z.array(ChatCompletionChoice),
  usage: z
    .object({
      prompt_tokens: z.number(),
      completion_tokens: z.number(),
      total_tokens: z.number(),
      completion_tokens_details: z
        .object({
          reasoning_tokens: z.number().optional(),
          accepted_prediction_tokens: z.number().optional(),
          rejected_prediction_tokens: z.number().optional(),
        })
        .optional(),
    })
    .optional(),
  system_fingerprint: z.string().nullable().optional(),
});