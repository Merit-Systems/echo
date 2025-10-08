import { OpenAIVideoCreateParamsSchema, OpenAIVideoSchema } from "./video/openai";
import { GeminiFlashImageInputSchema, GeminiFlashImageOutputSchema } from "./image/gemini";
import { z } from "zod";
import { ChatCompletionInput, ChatCompletionOutput } from "./chat/completions";

export function getSchemaForRoute(path: string): { input: unknown, output: unknown } | undefined {
    console.log('path', path);
    if (path.endsWith("/videos")) { 
        const returnObject = {
            input: z.toJSONSchema(OpenAIVideoCreateParamsSchema),
            output: z.toJSONSchema(OpenAIVideoSchema),
        }
        return returnObject;
    }
    if (path.endsWith(":generateContent")) {
        const returnObject = {
            input: z.toJSONSchema(GeminiFlashImageInputSchema),
            output: z.toJSONSchema(GeminiFlashImageOutputSchema),
        }
        return returnObject;
    }
    if (path.endsWith("/chat/completions")) {
        const returnObject = {
            input: z.toJSONSchema(ChatCompletionInput),
            output: z.toJSONSchema(ChatCompletionOutput),
        }
        return returnObject;
    }
    return undefined;
}