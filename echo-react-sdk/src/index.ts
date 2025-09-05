export { EchoProvider } from './components/EchoProvider';
export { EchoSignIn } from './components/EchoSignIn';
export { EchoSignOut } from './components/EchoSignOut';
export { EchoTokens } from './components/EchoTokens';
export { Logo } from './components/Logo';

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
} from './types';

export type { EchoContextValue } from './components/EchoProvider';
