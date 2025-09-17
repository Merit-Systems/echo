import './styles/index.css';

export { EchoProvider } from './components/EchoProvider';
export { EchoSignIn } from './components/EchoSignIn';
export { EchoSignOut } from './components/EchoSignOut';
export { EchoTokens } from './components/EchoTokens';
export { InsufficientFundsModal } from './components/InsufficientFundsModal';
export { Logo } from './components/Logo';

export { useEcho } from './hooks/useEcho';
export { useEchoClient } from './hooks/useEchoClient';
// OpenAI integration hook
export { useEchoOpenAI } from './hooks/useEchoOpenAI';
// Echo provider hooks
export { useEchoModelProviders } from './hooks/useEchoModelProviders';
// AI SDK integration hooks
export {
  EchoChatProvider,
  type ChatSendParams,
} from './components/EchoChatProvider';
export { useChat } from './hooks/useChat';

export type {
  EchoBalance,
  EchoAuthConfig as EchoConfig,
  EchoSignInProps,
  EchoSignOutProps,
  EchoTokensProps,
  EchoUser,
} from './types';

export { EchoContext } from './context';
export type { EchoContextValue } from './context';

export { EchoProviderRaw } from './components/EchoProvider';
export type { EchoProviderRawProps } from './components/EchoProvider';

export { EchoButton } from './components/EchoButton';