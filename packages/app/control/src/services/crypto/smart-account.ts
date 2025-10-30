import { CdpClient, type EvmSmartAccount } from '@coinbase/cdp-sdk';
import { env } from '@/env';

const API_KEY_ID = env.CDP_API_KEY_ID ?? 'your-api-key-id';
const API_KEY_SECRET = env.CDP_API_KEY_SECRET ?? 'your-api-key-secret';
const WALLET_SECRET = env.CDP_WALLET_SECRET ?? 'your-wallet-secret';
const WALLET_OWNER = env.WALLET_OWNER ?? 'your-wallet-owner';
const WALLET_SMART_ACCOUNT = env.WALLET_OWNER + '-smart-account';

export async function getSmartAccount(): Promise<{
  smartAccount: EvmSmartAccount;
}> {
  try {
    const cdp = new CdpClient({
      apiKeyId: API_KEY_ID,
      apiKeySecret: API_KEY_SECRET,
      walletSecret: WALLET_SECRET,
    });

    const owner = await cdp.evm.getOrCreateAccount({
      name: WALLET_OWNER,
    });

    const smartAccount = await cdp.evm.getOrCreateSmartAccount({
      name: WALLET_SMART_ACCOUNT,
      owner,
    });

    return { smartAccount };
  } catch (error) {
    throw new Error(
      `CDP authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
