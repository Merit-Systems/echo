import { z } from "zod";

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