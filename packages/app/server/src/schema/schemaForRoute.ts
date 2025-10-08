import { OpenAIVideoCreateParamsSchema, OpenAIVideoSchema } from "./video/openai";
import { z } from "zod";

export function getSchemaForRoute(path: string): { input: unknown, output: unknown } | undefined {
    console.log('path', path);
    if (path.endsWith("/videos")) { 
        const returnObject = {
            input: z.toJSONSchema(OpenAIVideoCreateParamsSchema),
            output: z.toJSONSchema(OpenAIVideoSchema),
        }
        console.log('returnObject', returnObject);
        return returnObject;
    }
    return undefined;
}