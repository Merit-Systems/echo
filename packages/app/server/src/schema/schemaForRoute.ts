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
import {
  TavilySearchInputSchema,
  TavilySearchOutputSchema,
} from 'resources/tavily/search/types';
import {
  TavilyExtractInputSchema,
  TavilyExtractOutputSchema,
} from 'resources/tavily/extract/types';
import {
  TavilyCrawlInputSchema,
  TavilyCrawlOutputSchema,
} from 'resources/tavily/crawl/types';
import {
  E2BExecuteInputSchema,
  E2BExecuteOutputSchema,
} from 'resources/e2b/types';

export function getSchemaForRoute(path: string):
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
  if (path.endsWith('/tavily/search')) {
    const inputSchema = z.toJSONSchema(TavilySearchInputSchema, {
      target: 'openapi-3.0',
    });
    const outputSchema = z.toJSONSchema(TavilySearchOutputSchema, {
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
  if (path.endsWith('/tavily/extract')) {
    const inputSchema = z.toJSONSchema(TavilyExtractInputSchema, {
      target: 'openapi-3.0',
    });
    const outputSchema = z.toJSONSchema(TavilyExtractOutputSchema, {
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
  if (path.endsWith('/tavily/crawl')) {
    const inputSchema = z.toJSONSchema(TavilyCrawlInputSchema, {
      target: 'openapi-3.0',
    });
    const outputSchema = z.toJSONSchema(TavilyCrawlOutputSchema, {
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
  if (path.endsWith('/e2b/execute')) {
    const inputSchema = z.toJSONSchema(E2BExecuteInputSchema, {
      target: 'openapi-3.0',
    });
    const outputSchema = z.toJSONSchema(E2BExecuteOutputSchema, {
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
