import { Request, Response } from 'express';
import { TavilyCrawlInputSchema } from './types';
import {
  calculateTavilyCrawlMaxCost,
  calculateTavilyCrawlActualCost,
  tavilyCrawl,
  createTavilyTransaction,
} from './tavily';
import { handleResourceRequestWithErrorHandling } from '../../handler';

export async function tavilyCrawlRoute(req: Request, res: Response) {
  return handleResourceRequestWithErrorHandling(req, res, {
    inputSchema: TavilyCrawlInputSchema,
    calculateMaxCost: input => calculateTavilyCrawlMaxCost(input),
    executeResource: tavilyCrawl,
    calculateActualCost: calculateTavilyCrawlActualCost,
    createTransaction: createTavilyTransaction,
    errorMessage: 'Error crawling tavily',
  });
}
