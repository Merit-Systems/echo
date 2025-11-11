import { createWalletClient, custom, http, type WalletClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet, base, optimism, polygon, arbitrum } from 'viem/chains'
import { getEthereumProvider } from '@/auth'
import { storage } from '@/config'
import type { Signer } from 'x402/types'

const CHAIN_MAP = {
  1: mainnet,
  8453: base,
  10: optimism,
  137: polygon,
  42161: arbitrum
}

export async function createWalletSigner(): Promise<Signer | null> {
  const provider = await getEthereumProvider()
  const session = await storage.getWalletSession()

  if (!provider || !session) {
    return null
  }

  const chain = CHAIN_MAP[session.chainId as keyof typeof CHAIN_MAP]

  if (!chain) {
    return null
  }

  const walletClient: WalletClient = createWalletClient({
    account: session.address as `0x${string}`,
    chain,
    transport: custom(provider)
  })

  return walletClient as unknown as Signer
}

export async function createLocalWalletSigner(): Promise<Signer | null> {
  const privateKey = await storage.getLocalWalletPrivateKey()
  const session = await storage.getLocalWalletSession()

  if (!privateKey || !session) {
    return null
  }

  const chain = CHAIN_MAP[session.chainId as keyof typeof CHAIN_MAP]

  if (!chain) {
    return null
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`)

  const walletClient: WalletClient = createWalletClient({
    account,
    chain,
    transport: http()
  })

  return walletClient as unknown as Signer
}
