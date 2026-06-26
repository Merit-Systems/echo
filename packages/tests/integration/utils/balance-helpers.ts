export interface BalanceSnapshot {
  totalPaid: number;
  totalSpent: number;
  balance: number;
}

interface WaitForBalanceUpdateOptions {
  timeoutMs?: number;
  intervalMs?: number;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function waitForBalanceUpdate(
  getBalance: () => Promise<BalanceSnapshot>,
  initialBalance: BalanceSnapshot,
  options: WaitForBalanceUpdateOptions = {}
): Promise<BalanceSnapshot> {
  const timeoutMs = options.timeoutMs ?? 5000;
  const intervalMs = options.intervalMs ?? 250;
  const deadline = Date.now() + timeoutMs;
  let latestBalance = await getBalance();

  while (Date.now() < deadline) {
    if (
      latestBalance.totalSpent > initialBalance.totalSpent ||
      latestBalance.balance < initialBalance.balance
    ) {
      return latestBalance;
    }

    await sleep(intervalMs);
    latestBalance = await getBalance();
  }

  throw new Error(
    `Balance did not update within ${timeoutMs}ms. Initial: ${JSON.stringify(
      initialBalance
    )}. Latest: ${JSON.stringify(latestBalance)}.`
  );
}
