import { db } from '@/lib/db';
import type { OutgoingPayment } from '@merit-systems/sdk';
import { MeritSDK } from '@merit-systems/sdk';
import { PayoutStatus } from '../referrals';

const sdk = new MeritSDK({
  apiKey: process.env.MERIT_API_KEY!,
  baseURL: process.env.MERIT_BASE_URL!,
  checkoutURL: process.env.MERIT_CHECKOUT_URL!,
});

const SENDER_GITHUB_ID = Number(process.env.MERIT_SENDER_GITHUB_ID!);

function generateCheckoutUrl(
  payeeGithubId: number,
  amount: number,
  senderGithubId: number,
  payOutEchoId: string
) {
  const checkoutUrl = sdk.checkout.generateCheckoutUrl({
    items: [{ type: 'user', id: payeeGithubId, amount: amount }],
    senderGithubId,
    groupId: payOutEchoId,
  });
  return checkoutUrl;
}

export async function generateCheckoutUrlForPayout(payoutId: string) {
  const payout = await db.payout.findUnique({
    where: { id: payoutId },
    include: {
      recipientGithubLink: { select: { githubId: true } },
      echoApp: { include: { githubLink: { select: { githubId: true } } } },
    },
  });

  if (!payout) {
    throw new Error('Payout not found');
  }
  if (!payout.recipientGithubLink) {
    throw new Error('Recipient GitHub link not found for payout');
  }

  const payeeGithubId = payout.recipientGithubLink.githubId;
  const amount = Number(payout.amount);
  console.log('payeeGithubId', payeeGithubId);
  console.log('amount', amount);
  console.log('SENDER_GITHUB_ID', SENDER_GITHUB_ID);
  console.log('payout.id', payout.id);
  const checkoutUrl = generateCheckoutUrl(
    payeeGithubId,
    amount,
    SENDER_GITHUB_ID,
    payout.id
  );
  return { url: checkoutUrl };
}

async function pollForCompletedPayoutTransaction(
  senderGithubId: number,
  payOutEchoId: string
): Promise<OutgoingPayment[] | null> {
  console.log('senderGithubId', senderGithubId);
  console.log('payOutEchoId', payOutEchoId);
  const payout = await sdk.payments.getPaymentsBySender(senderGithubId, {
    group_id: payOutEchoId,
  });
  console.log('payout', payout);
  if (payout.items.length > 0) {
    return payout.items;
  }
  return null;
}

async function logCompletedPayoutTransaction(payout: OutgoingPayment) {
  const existing = await db.payout.findUnique({
    where: { id: payout.group_id },
    select: { status: true },
  });

  if (!existing) {
    return;
  }

  if (existing.status === PayoutStatus.COMPLETED) {
    return;
  }

  await db.payout.update({
    where: { id: payout.group_id },
    data: {
      status: PayoutStatus.COMPLETED,
      transactionId: payout.tx_hash,
      senderAddress: payout.sender_id.toString(),
    },
  });
}

export async function pollMeritCheckout(payoutId: string) {
  const payout = await db.payout.findUnique({
    where: { id: payoutId },
    include: {
      echoApp: { include: { githubLink: { select: { githubId: true } } } },
    },
  });

  if (!payout) {
    throw new Error('Payout not found');
  }

  const senderGithubId = SENDER_GITHUB_ID;

  // poll every 10 seconds, up to 1 minute (max 6 attempts)
  for (let attempt = 0; attempt < 6; attempt++) {
    const results = await pollForCompletedPayoutTransaction(
      senderGithubId,
      payout.id
    );

    if (results && results.length > 0) {
      await Promise.all(results.map(r => logCompletedPayoutTransaction(r)));
      return { completed: true, count: results.length };
    }

    if (attempt < 5) {
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }

  return { completed: false };
}

export async function syncPendingPayoutsOnce() {
  const pending = await db.payout.findMany({
    where: { status: PayoutStatus.PENDING },
    include: {
      echoApp: { include: { githubLink: { select: { githubId: true } } } },
    },
  });

  for (const p of pending) {
    const senderGithubId = p.echoApp?.githubLink?.githubId ?? SENDER_GITHUB_ID;
    const results = await pollForCompletedPayoutTransaction(
      senderGithubId,
      p.id
    );
    if (results && results.length > 0) {
      await Promise.all(results.map(r => logCompletedPayoutTransaction(r)));
    }
  }

  return { scanned: pending.length };
}
