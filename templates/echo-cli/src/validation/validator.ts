import { z } from 'zod'
import { throwError, ErrorCode } from '@/utils'

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  
  if (!result.success) {
    const errors = result.error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`).join(', ')
    throwError({
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Validation failed',
      details: errors
    })
  }
  
  return result.data
}

export function isValid<T>(schema: z.ZodSchema<T>, data: unknown): data is T {
  return schema.safeParse(data).success
}

