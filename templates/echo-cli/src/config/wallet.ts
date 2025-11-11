export const WALLET_CHAINS = [1, 8453, 10, 137, 42161]

export const WALLET_OPTIONAL_METHODS = [
  'eth_sendTransaction',
  'eth_signTransaction',
  'eth_sign',
  'personal_sign',
  'eth_signTypedData',
  'eth_signTypedData_v4'
]

export const AUTH_OPTIONS = [
  { value: 'echo', label: 'Echo API Key' },
  { value: 'wallet', label: 'WalletConnect' },
  { value: 'local-wallet', label: 'Local Wallet (Self Custody)' }
]

export const CHAIN_OPTIONS = [
  { value: 1, label: 'Ethereum Mainnet' },
  { value: 8453, label: 'Base' },
  { value: 10, label: 'Optimism' },
  { value: 137, label: 'Polygon' },
  { value: 42161, label: 'Arbitrum' }
]
