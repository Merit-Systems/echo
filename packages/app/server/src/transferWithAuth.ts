import { ERC3009_ABI, USDC_ADDRESS } from "./services/fund-repo/constants";
import { encodeFunctionData } from "viem";
import { serializeTransaction } from "viem";
import { DOMAIN_NAME, DOMAIN_VERSION, DOMAIN_CHAIN_ID, TRANSFER_WITH_AUTHORIZATION_TYPE, TRANSFER_WITH_AUTHORIZATION_NAME, WALLET_OWNER } from "./constants";
import { Network, Schema, SettleRequest, TransferWithAuthorization, X402Version } from "./types";
import { FacilitatorClient } from "./facilitatorClient";
import { getSmartAccount } from "./utils";

export async function signTransferWithAuthorization(
    transfer: TransferWithAuthorization,
) {
    const {cdp} = await getSmartAccount();
    const owner = await cdp.evm.getOrCreateAccount({ name: WALLET_OWNER });

    const domain = {
        name: DOMAIN_NAME,
        version: DOMAIN_VERSION,
        chainId: DOMAIN_CHAIN_ID,
        verifyingContract: USDC_ADDRESS,
    }

    const message = {
        from: owner.address,
        to: transfer.to,
        value: transfer.value,
        validAfter: transfer.valid_after,
        validBefore: transfer.valid_before,
        nonce: transfer.nonce,
    }

    const authoriztionSignature = await cdp.evm.signTypedData({
        address: owner.address,
        domain,
        types: TRANSFER_WITH_AUTHORIZATION_TYPE,
        primaryType: TRANSFER_WITH_AUTHORIZATION_NAME,
        message,
    })

    const data = encodeFunctionData({
        abi: ERC3009_ABI,
        functionName: 'transferWithAuthorization',
        args: [
            owner.address,
            transfer.to as `0x${string}`,
            BigInt(transfer.value),
            BigInt(transfer.valid_after),
            BigInt(transfer.valid_before),
            transfer.nonce as `0x${string}`,
            authoriztionSignature.signature,
        ],
    })

    return await cdp.evm.signTransaction({
        address: owner.address,
        transaction: serializeTransaction({
            type: 'eip1559',
            chainId: DOMAIN_CHAIN_ID,
            to: USDC_ADDRESS,
            data,
            value: 0n,

            // gas
            gas: 3_000_000n,
            maxFeePerGas: 2_000_000_000n, // 2 Gwei
            maxPriorityFeePerGas: 1_000_000_000n, // 1 Gwei
        }),
    }).then(tx => tx.signature);
}

export async function settleWithAuthorization(
  transfer: TransferWithAuthorization,
) {
  const {cdp, smartAccount} = await getSmartAccount();
  const owner = await cdp.evm.getOrCreateAccount({ name: WALLET_OWNER });

  const signature = await signTransferWithAuthorization(transfer);
  const network = process.env.NETWORK as Network;

  const settleRequest: SettleRequest = {
    x402_version: X402Version.V1,
    payment_payload: {
      x402_version: X402Version.V1,
      schema: Schema.Exact,
      network: network,
      payload: {
        signature: signature,
        authorization: {
          from: owner.address,
          to: transfer.to,
          value: transfer.value,
          valid_after: transfer.valid_after,
          valid_before: transfer.valid_before,
          nonce: transfer.nonce,
        },
      },
    },
    payment_requirements: {
      schema: Schema.Exact,
      network: network,
      max_amount_required: transfer.value,
      resource: transfer.to,
      description: 'Transfer with Authorization',
      mime_type: 'application/json',
      pay_to: smartAccount.address,
      max_timeout_seconds: 1000,
      asset: USDC_ADDRESS,
    },
  }

  const facilitator = new FacilitatorClient(process.env.FACILITATOR_BASE_URL!);
  const result = await facilitator.settle(settleRequest);
  console.log('settleWithAuthorization result', result);
  return result;
}

export async function decodeSignature(signature: string) {
}