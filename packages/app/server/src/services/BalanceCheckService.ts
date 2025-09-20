import { PaymentRequiredError, UnauthorizedError } from '../errors/http';
import { EchoControlService } from './EchoControlService';

export interface BalanceCheckResult {
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

  // Check for free tier access first
  const freeTierSpendPoolInfo =
    await echoControlService.getOrNoneFreeTierSpendPool(userId, appId);

  if (freeTierSpendPoolInfo) {
    return {
      enoughBalance: true,
      usingFreeTier: true,
      effectiveBalance: freeTierSpendPoolInfo.effectiveBalance,
    };
  }

  // If no free tier, check regular balance
  const balance = await echoControlService.getBalance();

  if (balance > MINIMUM_SPEND_AMOUNT_SAFETY_BUFFER) {
    return {
      enoughBalance: true,
      usingFreeTier: false,
      effectiveBalance: balance,
    };
  }
  throw new PaymentRequiredError('Payment Required');
}
