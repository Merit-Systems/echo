import express, { Request, Response, Router } from 'express';
import path from 'path';
import logger, { logMetric } from '../logger';
import { TavilySearchInputSchema } from '../resources/tavily/types';
import { calculateTavilySearchCost, tavilySearch, createTavilyTransaction } from '../resources/tavily/tavily';
import { buildX402Response, isApiRequest, isX402Request } from 'utils';
import { authenticateRequest } from 'auth';
import { prisma } from 'server';
import { settle, finalize } from 'handlers';        
const resourceRouter: Router = Router();

resourceRouter.post('/tavily/search', async (req: Request, res: Response) => {
    try {
        const headers = req.headers as Record<string, string>;

        const inputBody = TavilySearchInputSchema.parse(req.body);

        const maxCost = calculateTavilySearchCost(inputBody);

        if (
            !isApiRequest(headers) &&
            !isX402Request(headers)
        ) {
            buildX402Response(req, res, maxCost);
            return;
        }
    
        if (isApiRequest(headers)) {
            const { echoControlService } =
            await authenticateRequest(headers, prisma);

            const output = await tavilySearch(inputBody);

            const transaction = createTavilyTransaction(inputBody, output, maxCost);

            await echoControlService.createTransaction(transaction, maxCost);

            return res.status(200).json(output);
        } else if (isX402Request(headers)) {

            const settleResult = await settle(req, res, headers, maxCost);
            if (!settleResult) {
                buildX402Response(req, res, maxCost);
                return;
            }
            const { payload, paymentAmountDecimal } = settleResult;

            const output = await tavilySearch(inputBody);

            const transaction = createTavilyTransaction(inputBody, output, maxCost);

            await finalize(paymentAmountDecimal, transaction, payload);

            return res.status(200).json(output);
        } else {
            buildX402Response(req, res, maxCost);
            return;
        }
    } catch (error) {
        logger.error('Error searching tavily', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});




export default resourceRouter;