'use client';

import { useAccount, useEnsName } from 'wagmi';

export function WalletStatus() {
  const { address, isConnected, chain } = useAccount();
  const { data: ensName } = useEnsName({ address });

  if (!isConnected) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm dark:bg-gray-800">
      <div className="h-2 w-2 rounded-full bg-green-500" />
      <span className="font-medium">
        {ensName || `${address?.slice(0, 6)}...${address?.slice(-4)}`}
      </span>
      {chain && (
        <span className="text-gray-500 text-xs dark:text-gray-400">
          on {chain.name}
        </span>
      )}
    </div>
  );
}
