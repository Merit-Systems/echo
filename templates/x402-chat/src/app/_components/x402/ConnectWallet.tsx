'use client';

import { ConnectKitButton } from 'connectkit';

export const ConnectWallet = () => {
  return <ConnectKitButton showBalance={false} showAvatar={false} />;
};
