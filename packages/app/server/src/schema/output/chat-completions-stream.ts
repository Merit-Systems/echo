import { z } from "zod";

// Delta object: partial message updates
const ChatDelta = z.object({
  role: z.enum(["system", "user", "assistant", "function"]).optional(),
  content: z.string().nullable().optional(),
  function_call: z
    .object({
      name: z.string().optional(),
      arguments: z.string().optional(),
    })
    .optional(),
  tool_calls: z
    .array(
      z.object({
        id: z.string().optional(),
        type: z.enum(["function"]),
        function: z.object({
          name: z.string().optional(),
          arguments: z.string().optional(),
        }),
      })
    )
    .optional(),
});

// Each chunk contains choices, but with "delta" instead of full message
const ChatCompletionChunkChoice = z.object({
  index: z.number(),
  delta: ChatDelta, // partial update
  finish_reason: z
    .enum(["stop", "length", "tool_calls", "content_filter", "function_call"])
    .nullable()
    .optional(),
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

// Streaming response chunk
export const ChatCompletionChunk = z.object({
  id: z.string(),
  object: z.literal("chat.completion.chunk"),
  created: z.number(),
  model: z.string(),
  choices: z.array(ChatCompletionChunkChoice),
  system_fingerprint: z.string().nullable().optional(),
});

export type ChatCompletionChunk = z.infer<typeof ChatCompletionChunk>;
