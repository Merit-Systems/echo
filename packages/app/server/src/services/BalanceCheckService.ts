import { X402_ERROR_MESSAGE } from '../constants';
import { UnauthorizedError } from '../errors/http';
import { PaymentRequiredError } from '../errors';
import { EchoControlService } from './EchoControlService';
import logger from '../logger';

interface BalanceCheckResult {
  enoughBalance: boolean;
  usingFreeTier: boolean;
  effectiveBalance: number | null;
}

const MINIMUM_SPEND_AMOUNT_SAFETY_BUFFER = 0.0001;

/**
 * Check if the user has sufficient balance or free tier access
 * @throws PaymentRequiredError if user has no balance and no free tier access
 */
export async function checkBalance(
  echoControlService: EchoControlService
): Promise<BalanceCheckResult> {
  const userId = echoControlService.getUserId();
  const appId = echoControlService.getEchoAppId();

  if (!userId || !appId) {
    throw new UnauthorizedError('Unauthorized');
  }

  const freeTierResult =
    await echoControlService.getOrNoneFreeTierSpendPool(userId, appId);

  if (freeTierResult.isErr()) {
    logger.error('Failed to check free tier', { error: freeTierResult.error });
  } else if (freeTierResult.value) {
    return {
      enoughBalance: true,
      usingFreeTier: true,
      effectiveBalance: freeTierResult.value.effectiveBalance,
    };
  }

  const balanceResult = await echoControlService.getBalance();

  if (balanceResult.isErr()) {
    logger.error('Failed to check balance', { error: balanceResult.error });
    throw new PaymentRequiredError();
  }

  const balance = balanceResult.value;

  if (balance > MINIMUM_SPEND_AMOUNT_SAFETY_BUFFER) {
    return {
      enoughBalance: true,
      usingFreeTier: false,
      effectiveBalance: balance,
    };
  }
  throw new PaymentRequiredError();
}
