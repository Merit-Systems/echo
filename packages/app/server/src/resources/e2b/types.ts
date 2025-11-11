import { z } from 'zod';

// Input schema
export const E2BExecuteInputSchema = z.object({
  snippet: z.string().min(1, 'Code snippet cannot be empty'),
});

export type E2BExecuteInput = z.infer<typeof E2BExecuteInputSchema>;

// Chart type enums
const ChartTypeSchema = z.enum([
  'line',
  'scatter',
  'bar',
  'pie',
  'box_and_whisker',
  'superchart',
  'unknown',
]);

const ScaleTypeSchema = z.enum([
  'linear',
  'datetime',
  'categorical',
  'log',
  'symlog',
  'logit',
  'function',
  'functionlog',
  'asinh',
]);

// Result schema
const ResultSchema = z.object({
  isMainResult: z.boolean(),
  text: z.string().optional(),
  html: z.string().optional(),
  markdown: z.string().optional(),
  svg: z.string().optional(),
  png: z.string().optional(),
  jpeg: z.string().optional(),
  pdf: z.string().optional(),
  latex: z.string().optional(),
  json: z.string().optional(),
  javascript: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  chart: z.unknown().optional(), // ChartTypes is complex
  extra: z.unknown().optional(),
  raw: z.record(z.string(), z.unknown()),
});

type Result = z.infer<typeof ResultSchema>;

// Logs schema
const LogsSchema = z.object({
  stdout: z.array(z.string()),
  stderr: z.array(z.string()),
});

type Logs = z.infer<typeof LogsSchema>;

// Execution error schema
const ExecutionErrorSchema = z.object({
  name: z.string(),
  value: z.string(),
  traceback: z.string(),
});

type ExecutionError = z.infer<typeof ExecutionErrorSchema>;

// Output schema
export const E2BExecuteOutputSchema = z.object({
  results: z.array(ResultSchema),
  logs: LogsSchema,
  error: ExecutionErrorSchema.optional(),
  executionCount: z.number().optional(),
  cost: z.number(),
  sandboxId: z.string(),
  duration: z.number(),
});

export type E2BExecuteOutput = z.infer<typeof E2BExecuteOutputSchema>;
