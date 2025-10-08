import { OpenAIVideoCreateParamsSchema, OpenAIVideoSchema } from "./video/openai";
import { GeminiFlashImageInputSchema, GeminiFlashImageOutputSchema } from "./image/gemini";
import { z } from "zod";
import { ChatCompletionInput, ChatCompletionOutput } from "./chat/completions";
import { CreateImagesRequest, CreateImagesResponse } from "./image/openai";

export function getSchemaForRoute(path: string): { input: unknown, output: unknown } | undefined {
    if (path.endsWith("/videos")) {
        return {
            input: z.toJSONSchema(OpenAIVideoCreateParamsSchema),
            output: z.toJSONSchema(OpenAIVideoSchema),
        };
    }
    if (path.endsWith("/images/generations")) {
        return {
            input: z.toJSONSchema(CreateImagesRequest),
            output: z.toJSONSchema(CreateImagesResponse),
        };
    }
    if (path.endsWith(":generateContent")) {
        return {
            input: z.toJSONSchema(GeminiFlashImageInputSchema),
            output: z.toJSONSchema(GeminiFlashImageOutputSchema),
        };
    }
    if (path.endsWith("/chat/completions")) {
        return {
            input: z.toJSONSchema(ChatCompletionInput),
            output: z.toJSONSchema(ChatCompletionOutput),
        };
    }
    return undefined;
}