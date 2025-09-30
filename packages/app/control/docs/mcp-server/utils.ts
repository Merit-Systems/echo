import { z } from 'zod';

interface JsonSchemaProperty {
  type: string;
  description?: string;
}

interface JsonSchema {
  type: string;
  properties: Record<string, JsonSchemaProperty>;
  required: string[];
}

// Helper function to convert Zod schema to JSON schema
export function zodToJsonSchema(schema: z.ZodType): JsonSchema {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape as Record<string, z.ZodType>;
    const properties: Record<string, JsonSchemaProperty> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
      if (value instanceof z.ZodNumber) {
        properties[key] = { type: 'number' };
        if (value.description) {
          properties[key].description = value.description;
        }
      } else if (value instanceof z.ZodString) {
        properties[key] = { type: 'string' };
        if (value.description) {
          properties[key].description = value.description;
        }
      } else if (value instanceof z.ZodOptional) {
        const innerType = value._def.innerType as z.ZodType;
        if (innerType instanceof z.ZodNumber) {
          properties[key] = { type: 'number' };
          if (innerType.description) {
            properties[key].description = innerType.description;
          }
        } else if (innerType instanceof z.ZodString) {
          properties[key] = { type: 'string' };
          if (innerType.description) {
            properties[key].description = innerType.description;
          }
        }
      }
      if (!value.isOptional()) {
        required.push(key);
      }
    }

    return {
      type: 'object',
      properties,
      required,
    };
  }
  return {
    type: 'object',
    properties: {},
    required: [],
  };
}
