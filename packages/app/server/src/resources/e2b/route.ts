import { Request, Response } from 'express';
import { Decimal } from '@prisma/client/runtime/library';
import { E2BExecuteInputSchema } from './types';
import {
  calculateE2BExecuteCost,
  e2bExecutePythonSnippet,
  createE2BTransaction,
} from './e2b';
import { handleResourceRequestWithErrorHandling } from '../handler';

export async function e2bExecuteRoute(req: Request, res: Response) {
  return handleResourceRequestWithErrorHandling(req, res, {
    inputSchema: E2BExecuteInputSchema,
    calculateMaxCost: () => calculateE2BExecuteCost(),
    executeResource: input => e2bExecutePythonSnippet(input.snippet),
    calculateActualCost: (_input, output) => new Decimal(output.cost),
    createTransaction: createE2BTransaction,
    errorMessage: 'Error executing e2b code',
  });
}
