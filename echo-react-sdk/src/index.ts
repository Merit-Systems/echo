export { EchoProvider } from './components/EchoProvider';
export { EchoSignIn } from './components/EchoSignIn';
export { EchoSignOut } from './components/EchoSignOut';
export { EchoTokens } from './components/EchoTokens';
export { Logo } from './components/Logo';

// Deprecated exports - for backwards compatibility
/**
 * @deprecated Use EchoTokens instead. EchoTokenPurchase will be removed in a future version.
 */
export { EchoTokenPurchase } from './components/EchoTokenPurchase';

export { useEcho } from './hooks/useEcho';
// useEchoRefresh is kept internal - most apps don't need refresh state
export { useEchoClient } from './hooks/useEchoClient';
// OpenAI integration hook
export { useEchoOpenAI } from './hooks/useEchoOpenAI';
// Echo provider hooks
export { useEchoModelProviders } from './hooks/useEchoModelProviders';
// AI SDK integration hooks
export { EchoChatProvider } from './components/EchoChatProvider';
export { useChat } from './hooks/useChat';

export type {
  EchoBalance,
  EchoAuthConfig as EchoConfig,
  EchoSignInProps,
  EchoSignOutProps,
  EchoTokensProps,
  EchoUser,
  // Deprecated types - for backwards compatibility
  EchoTokenPurchaseProps,
} from './types';

export type {
  EchoContextValue,
  PaymentRequiredInfo,
} from './components/EchoProvider';
