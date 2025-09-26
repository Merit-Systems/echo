'use client';

import { ConnectKitButton } from 'connectkit';

export const ConnectWallet = () => {
  return <ConnectKitButton showBalance={true} showAvatar={false} />;
};
