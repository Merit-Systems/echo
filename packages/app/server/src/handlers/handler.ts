import { HandlerInput, X402HandlerInput, Transaction } from 'types';
import { modelRequestService } from 'services/ModelRequestService';
import { makeProxyPassthroughRequest } from 'services/ProxyPassthroughService';

type SettlementContext = unknown;

export async function handleEchoTransaction<T extends SettlementContext>(
  input: HandlerInput | X402HandlerInput,
  settleFn: () => Promise<T | null>,
  finalizeFn: (transaction: Transaction, context: T) => Promise<void>,
  errorHandlerFn?: (context: T) => Promise<void>
) {
  const { req, res, headers, isPassthroughProxyRoute, provider, isStream } = input;

  const settlementContext = await settleFn();
  if (!settlementContext) {
    return;
  }

  if (isPassthroughProxyRoute) {
    return await makeProxyPassthroughRequest(
      req,
      res,
      provider,
      headers
    );
  }

  const transactionResult = await modelRequestService.executeModelRequest(
    req,
    res,
    headers,
    provider,
    isStream
  ).catch(async (error) => {
    if (errorHandlerFn) {
      await errorHandlerFn(settlementContext);
    }
    throw error;
  });

  const { transaction, data } = transactionResult;

  modelRequestService.handleResolveResponse(res, isStream, data);

  await finalizeFn(transaction, settlementContext);
}