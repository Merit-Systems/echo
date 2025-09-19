import { useEcho } from '@merit-systems/echo-react-sdk';
import { EchoAccountButton } from './echo-account';

export function EchoAccount() {
  const echo = useEcho();
  return <EchoAccountButton echo={echo} />;
}
