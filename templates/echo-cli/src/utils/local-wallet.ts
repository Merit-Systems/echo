import QRCode from 'qrcode-terminal'
import { createPublicClient, http, type Address } from 'viem'
import { privateKeyToAccount, generatePrivateKey } from 'viem/accounts'
import { mainnet, base, optimism, polygon, arbitrum } from 'viem/chains'
import { storage } from '@/config'

const CHAIN_MAP = {
  1: mainnet,
  8453: base,
  10: optimism,
  137: polygon,
  42161: arbitrum
} as const

const USDC_ADDRESSES: Record<number, Address> = {
  1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  10: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
  137: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
  42161: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
}

const USDC_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function'
  }
] as const

export interface GeneratedWallet {
  privateKey: `0x${string}`
  address: Address
}

export function generateWallet(): GeneratedWallet {
  const privateKey = generatePrivateKey()
  const account = privateKeyToAccount(privateKey)
  
  return {
    privateKey,
    address: account.address
  }
}

export function getLocalWalletAddress(privateKey: `0x${string}`): Address {
  const account = privateKeyToAccount(privateKey)
  return account.address
}

export function formatPrivateKeyForDisplay(key: string): string {
  if (key.length <= 10) {
    return key
  }
  return `${key.slice(0, 6)}...${key.slice(-4)}`
}

export function generateQRCodeForAddress(address: string): void {
  QRCode.generate(address, { small: true }, (qr: string) => {
    console.log(qr)
  })
}

export async function getUSDCBalance(address: Address, chainId: number): Promise<string> {
  const chain = CHAIN_MAP[chainId as keyof typeof CHAIN_MAP]
  const usdcAddress = USDC_ADDRESSES[chainId]

  if (!chain || !usdcAddress) {
    throw new Error(`Unsupported chain: ${chainId}`)
  }

  const publicClient = createPublicClient({
    chain,
    transport: http()
  })

  try {
    const balance = await publicClient.readContract({
      address: usdcAddress,
      abi: USDC_ABI,
      functionName: 'balanceOf',
      args: [address]
    }) as bigint

    // USDC has 6 decimals
    const balanceNumber = Number(balance) / 1_000_000
    return balanceNumber.toFixed(2)
  } catch (err) {
    // If balance query fails, return 0
    return '0.00'
  }
}

export async function clearLocalWalletSession(): Promise<void> {
  await storage.deleteLocalWalletPrivateKey()
  await storage.deleteLocalWalletSession()
  await storage.deleteAuthMethod()
}

