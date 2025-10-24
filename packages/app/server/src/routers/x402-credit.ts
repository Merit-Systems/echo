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

x402Router.all('/', async (req: EscrowRequest, res: ExpressResponse) => {
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

    const x402RequestPriceRaw =
      await handleX402CreditRequestService.getX402RequestPrice();
    const x402RequestPrice =
      handleX402CreditRequestService.convertUsdcToDecimal(x402RequestPriceRaw);
    logger.info('X402 pricing check', {
      x402RequestPriceRaw: x402RequestPriceRaw.toString(),
      x402RequestPrice: x402RequestPrice.toString(),
      balanceCheckDecimal: balanceCheckDecimal.toString(),
    });
    if (x402RequestPrice.gt(balanceCheckDecimal)) {
      return res.status(402).json({ error: 'Insufficient balance' });
    }

    const proxyUrl = handleX402CreditRequestService.getRequestUrl();
    const resourcePath = proxyUrl.origin + proxyUrl.pathname;
    const queryParams: Record<string, string> = {};
    proxyUrl.searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    const resourceArgs =
      req.method === 'GET' ? queryParams : { queryParams, body: req.body };

    const transaction: Transaction = {
      metadata: {
        resourcePath,
        resourceArgs,
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
    const body = await response.json();
    return res.status(response.status).json(body);
  } catch (error) {
    logger.error('Failed to handle X402 credit request', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export { x402Router };
