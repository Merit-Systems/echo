import { TransactionEscrowMiddleware } from 'middleware/transaction-escrow-middleware';
import { HandlerInput, Transaction } from 'types';
import { calculateRefundAmount } from 'utils';
import { checkBalance } from 'services/BalanceCheckService';
import { prisma } from 'server';
import { Decimal } from '@prisma/client/runtime/library';
import { EchoControlService } from 'services/EchoControlService';

type ApiKeyContext = {
  maxCost: Decimal;
  echoControlService: EchoControlService;
};

async function settle(
  req: HandlerInput['req'],
  res: HandlerInput['res'],
  echoControlService: EchoControlService
) {
  const transactionEscrowMiddleware = new TransactionEscrowMiddleware(prisma);
  const balanceCheckResult = await checkBalance(echoControlService);

  transactionEscrowMiddleware.setupEscrowContext(
    req,
    echoControlService.getUserId()!,
    echoControlService.getEchoAppId()!,
    balanceCheckResult.effectiveBalance ?? 0
  );

  await transactionEscrowMiddleware.handleInFlightRequestIncrement(req, res);

  return echoControlService;
}

async function finalize(
  transaction: Transaction,
  context: ApiKeyContext
) {
  calculateRefundAmount(context.maxCost, transaction.rawTransactionCost);
  await context.echoControlService.createTransaction(transaction, context.maxCost);
}

export async function handleApiKeyRequest(input: HandlerInput) {
  const { handleEchoTransaction } = await import('./handler');
  
  await handleEchoTransaction(
    input,
    () => settle(input.req, input.res, input.echoControlService),
    (transaction, echoControlService) => finalize(transaction, {
      maxCost: input.maxCost,
      echoControlService,
    })
  );
}
  