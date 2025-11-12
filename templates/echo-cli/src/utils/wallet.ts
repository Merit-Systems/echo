import { EthereumProvider } from '@walletconnect/ethereum-provider'
import { storage, StorageAdapter } from '@/config'
import { WALLETCONNECT_PROJECT_ID, APP_METADATA, WALLET_CHAINS, WALLET_OPTIONAL_METHODS } from '@/constants'
import pino from 'pino'

export type EthereumProviderInstance = Awaited<ReturnType<typeof EthereumProvider.init>>

export function formatAddress(address: string, prefixLength: number = 6, suffixLength: number = 4): string {
  if (address.length <= prefixLength + suffixLength) {
    return address
  }
  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`
}

export function parseCAIP10Address(caip10: string): { chainId: number; address: string } | null {
  const parts = caip10.split(':')
  
  if (parts.length !== 3 || parts[0] !== 'eip155') {
    return null
  }

  return {
    chainId: parseInt(parts[1]),
    address: parts[2]
  }
}

export async function initializeEthereumProvider(): Promise<EthereumProviderInstance> {
  const storageAdapter = new StorageAdapter(storage)
  
  return EthereumProvider.init({
    projectId: WALLETCONNECT_PROJECT_ID,
    metadata: APP_METADATA,
    showQrModal: false,
    optionalChains: WALLET_CHAINS as [number, ...number[]],
    optionalMethods: WALLET_OPTIONAL_METHODS,
    storage: storageAdapter,
    logger: pino({ level: 'silent' })
  })
}

export async function clearWalletSession(): Promise<void> {
  await storage.deleteWalletSession()
  await storage.deleteAuthMethod()
}
