import { Router } from 'express';
import { checkBalance } from 'services/BalanceCheckService';
import { Transaction, X402CreditHandlerInput } from 'types';
import { X402CreditRequestService } from 'services/HandleX402CreditService';
import { Decimal } from 'generated/prisma/runtime/library';
import logger from 'logger';
import { authenticateRequest } from 'auth';
import { EscrowRequest } from 'middleware/transaction-escrow-middleware';
import { prisma } from 'server';
import { Response as ExpressResponse } from 'express';
import { EchoDbService } from 'services/DbService';

const x402Router: Router = Router();

x402Router.post('/', async (req: EscrowRequest, res: ExpressResponse) => {
  try {
    const headers = req.headers as Record<string, string>;
    const { processedHeaders, echoControlService } = await authenticateRequest(
      headers,
      prisma
    );

    const dbService = new EchoDbService(prisma);

    return handleApiX402CreditRequest({
      req,
      res,
      headers: processedHeaders,
      echoControlService,
      dbService,
    });
  } catch (error) {
    logger.error('Failed to handle X402 credit request', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export async function handleApiX402CreditRequest({
  req,
  res,
  headers,
  echoControlService,
  dbService,
}: X402CreditHandlerInput) {
  try {
    const handleX402CreditRequestService = new X402CreditRequestService({
      req,
      res,
      headers,
      echoControlService,
      dbService,
    });

    const balanceCheckResult = await checkBalance(echoControlService);
    const balanceCheckDecimal = new Decimal(
      balanceCheckResult.effectiveBalance || 0
    );

    const x402RequestPrice =
      await handleX402CreditRequestService.getX402RequestPrice();
    if (x402RequestPrice.gt(balanceCheckDecimal)) {
      return res.status(402).json({ error: 'Insufficient balance' });
    }

    const transaction: Transaction = {
      metadata: {
        resourcePath: req.body.resourcePath,
        resourceArgs: req.body.resourceArgs,
        resourceResponse: req.body.resourceResponse,
        resourceError: req.body.resourceError,
      },
      rawTransactionCost: x402RequestPrice,
      status: 'success',
    };

    const createdTransaction = await echoControlService.createTransaction(
      transaction,
      x402RequestPrice
    );
    const response =
      await handleX402CreditRequestService.executeX402RequestAndUpdateMetadata(
        createdTransaction
      );

    return res.status(response.status).json(response.body);
  } catch (error) {
    logger.error('Failed to handle X402 credit request', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export { x402Router };
