'use client';

import { useEcho } from '@merit-systems/echo-next-sdk/client';
import { EchoAccountButton } from './echo-account';

export function EchoAccount() {
  const echo = useEcho();
  return <EchoAccountButton echo={echo} />;
}
