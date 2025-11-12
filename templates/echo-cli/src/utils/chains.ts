export const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum',
  8453: 'Base',
  10: 'Optimism',
  137: 'Polygon',
  42161: 'Arbitrum'
}

export const CHAIN_NAMES_FULL: Record<number, string> = {
  1: 'Ethereum Mainnet',
  8453: 'Base',
  10: 'Optimism',
  137: 'Polygon',
  42161: 'Arbitrum One'
}

export function getChainName(chainId: number, full: boolean = false): string {
  const chains = full ? CHAIN_NAMES_FULL : CHAIN_NAMES
  return chains[chainId] || 'Unknown'
}

export function isSupported(chainId: number): boolean {
  return chainId in CHAIN_NAMES
}
