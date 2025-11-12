'use client';

import { api } from '@/trpc/client';
import { Lock } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface Props {
  appId: string;
}

export const ActivityOverlay: React.FC<Props> = ({ appId }) => {
  const [shouldRefetchTransactions, setShouldRefetchTransactions] =
    useState(true);
  const [shouldRefetchTokens, setShouldRefetchTokens] = useState(true);
  const [shouldRefetchApiKeys, setShouldRefetchApiKeys] = useState(true);

  const [isOwner] = api.apps.app.isOwner.useSuspenseQuery(appId);
  const [numTokens] = api.apps.app.getNumTokens.useSuspenseQuery(
    { appId },
    {
      refetchOnWindowFocus: shouldRefetchTokens,
      refetchInterval: shouldRefetchTokens ? 2500 : undefined,
    }
  );
  const [numApiKeys] = api.user.apiKeys.count.useSuspenseQuery(
    { appId },
    {
      refetchOnWindowFocus: shouldRefetchApiKeys,
      refetchInterval: shouldRefetchApiKeys ? 2500 : undefined,
    }
  );
  const [numTransactions] = api.apps.app.transactions.count.useSuspenseQuery(
    {
      appId,
    },
    {
      refetchOnWindowFocus: shouldRefetchTransactions,
      refetchInterval: shouldRefetchTransactions ? 2500 : undefined,
    }
  );

  useEffect(() => {
    // For API key mode, stop polling if API keys exist
    if (numApiKeys > 0) {
      setShouldRefetchApiKeys(false);
      setShouldRefetchTransactions(false);
    } else {
      // For OAuth mode, continue polling until transactions exist
      setShouldRefetchTransactions(numTransactions === 0);
      setShouldRefetchApiKeys(numApiKeys === 0);
    }
    setShouldRefetchTokens(numTokens === 0);
  }, [numTransactions, numTokens, numApiKeys]);

  // For API key mode: show activity if API keys exist (no transaction requirement)
  // For OAuth mode: show activity only if transactions exist
  const shouldShowOverlay = numApiKeys > 0 ? false : numTransactions === 0;

  return (
    <AnimatePresence>
      {shouldShowOverlay && (
        <motion.div
          className="absolute inset-0 bg-card/60 z-50 flex flex-col gap-4 items-center justify-center backdrop-blur-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Lock className="size-16 text-primary" />
          <p className="text-lg font-medium text-center max-w-xs">
            {isOwner
              ? numTokens === 0 && numApiKeys === 0
                ? 'Connect to Echo from your app to view your app activity'
                : 'Generate text from your app to view your app activity'
              : 'The owner of this app has not connected to Echo yet'}
            {}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
