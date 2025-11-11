export { isAuthenticated } from './auth'
export { consumeStream } from './stream'
export { createThinkingSpinner } from './spinner'
export { getChainName, isSupported, CHAIN_NAMES, CHAIN_NAMES_FULL } from './chains'
export { 
  formatAddress, 
  parseCAIP10Address, 
  initializeEthereumProvider,
  clearWalletSession,
  type EthereumProviderInstance
} from './wallet'
export { createWalletSigner, createLocalWalletSigner } from './signer'
export {
  generateWallet,
  getLocalWalletAddress,
  formatPrivateKeyForDisplay,
  generateQRCodeForAddress,
  getUSDCBalance,
  clearLocalWalletSession,
  type GeneratedWallet
} from './local-wallet'
export {
  ErrorCode,
  AppError,
  createError,
  throwError,
  handleError,
  displayAppError,
  extractErrorMessage,
  isAppError,
  isErrorCode,
  is402PaymentError,
  transformPaymentError,
  type ErrorContext
} from './errors'
