import {
  OpenAIVideoCreateParamsSchema,
  OpenAIVideoSchema,
} from './video/openai';
import {
  GeminiFlashImageInputSchema,
  GeminiFlashImageOutputSchema,
} from './image/gemini';
import { z } from 'zod';
import { ChatCompletionInput, ChatCompletionOutput } from './chat/completions';
import { CreateImagesRequest, CreateImagesResponse } from './image/openai';

export function getSchemaForRoute(
  path: string
):
  | {
      input: { type: 'http'; method: string; bodyFields?: unknown };
      output: unknown;
    }
  | undefined {
  if (path.endsWith('/videos')) {
    const inputSchema = z.toJSONSchema(OpenAIVideoCreateParamsSchema, {
      target: 'openapi-3.0',
    });
    const outputSchema = z.toJSONSchema(OpenAIVideoSchema, {
      target: 'openapi-3.0',
    });
    return {
      input: {
        type: 'http',
        method: 'POST',
        bodyFields: inputSchema.properties,
      },
      output: outputSchema.properties,
    };
  }
  if (path.endsWith('/images/generations')) {
    const inputSchema = z.toJSONSchema(CreateImagesRequest, {
      target: 'openapi-3.0',
    });
    const outputSchema = z.toJSONSchema(CreateImagesResponse, {
      target: 'openapi-3.0',
    });
    return {
      input: {
        type: 'http',
        method: 'POST',
        bodyFields: inputSchema.properties,
      },
      output: outputSchema.properties,
    };
  }
  if (path.endsWith(':generateContent')) {
    const inputSchema = z.toJSONSchema(GeminiFlashImageInputSchema, {
      target: 'openapi-3.0',
    });
    const outputSchema = z.toJSONSchema(GeminiFlashImageOutputSchema, {
      target: 'openapi-3.0',
    });
    return {
      input: {
        type: 'http',
        method: 'POST',
        bodyFields: inputSchema.properties,
      },
      output: outputSchema.properties,
    };
  }
  if (path.endsWith('/chat/completions')) {
    const inputSchema = z.toJSONSchema(ChatCompletionInput, {
      target: 'openapi-3.0',
    });
    const outputSchema = z.toJSONSchema(ChatCompletionOutput, {
      target: 'openapi-3.0',
    });
    return {
      input: {
        type: 'http',
        method: 'POST',
        bodyFields: inputSchema.properties,
      },
      output: outputSchema.properties,
    };
  }
  return undefined;
}
