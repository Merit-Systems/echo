'use client';

import { useEffect, useMemo, useState } from 'react';

import { api } from '@/trpc/client';

export const useAppConnectionSetup = (appId: string) => {
  const [shouldRefetchConnection, setShouldRefetchConnection] = useState(true);
  const [shouldRefetchTransactions, setShouldRefetchTransactions] =
    useState(true);

  // check whether the user has connected to the app

  const utils = api.useUtils();

  const [numTokens] = api.apps.app.getNumTokens.useSuspenseQuery(
    { appId },
    {
      refetchInterval: shouldRefetchConnection ? 2500 : undefined,
    }
  );
  const [numApiKeys] = api.user.apiKeys.count.useSuspenseQuery(
    { appId },
    {
      refetchInterval: shouldRefetchConnection ? 2500 : undefined,
    }
  );
  const [transactionsCount] = api.apps.app.transactions.count.useSuspenseQuery(
    {
      appId,
    },
    {
      refetchInterval: shouldRefetchTransactions ? 2500 : undefined,
    }
  );

  const isConnected = useMemo(() => {
    return numTokens > 0 || numApiKeys > 0 || transactionsCount > 0;
  }, [numTokens, numApiKeys, transactionsCount]);

  useEffect(() => {
    setShouldRefetchConnection(!isConnected);
  }, [isConnected]);

  const [numTransactions] = api.apps.app.transactions.count.useSuspenseQuery(
    {
      appId,
    },
    {
      refetchInterval: shouldRefetchTransactions ? 2500 : undefined,
    }
  );

  const hasMadeTransactions = useMemo(() => {
    return numTransactions > 0;
  }, [numTransactions]);

  useEffect(() => {
    // For API key mode, stop polling for transactions if API keys exist
    // For OAuth mode, continue polling until transactions are made
    if (numApiKeys > 0) {
      setShouldRefetchTransactions(false);
    } else {
      setShouldRefetchTransactions(!hasMadeTransactions);
    }
    void utils.apps.app.stats.bucketed.invalidate({ appId });
  }, [hasMadeTransactions, appId, utils, numApiKeys]);

  const connectionSteps = useMemo(() => {
    // For API key mode, if API keys exist, we don't require transactions
    // API keys are a valid authentication method that doesn't need immediate usage
    if (numApiKeys > 0) {
      return [isConnected];
    }
    // For OAuth mode, require both connection and transactions
    return [isConnected, hasMadeTransactions];
  }, [isConnected, hasMadeTransactions, numApiKeys]);

  const completedConnectionSteps = useMemo(() => {
    return connectionSteps.filter(Boolean);
  }, [connectionSteps]);

  const isConnectionComplete = useMemo(() => {
    return completedConnectionSteps.length === connectionSteps.length;
  }, [connectionSteps.length, completedConnectionSteps.length]);

  return {
    isConnected,
    hasMadeTransactions,
    connectionSteps,
    completedConnectionSteps,
    isConnectionComplete,
  };
};

export const useAppDetailsSetup = (appId: string) => {
  const [app] = api.apps.app.get.useSuspenseQuery({ appId });
  const [githubLink] = api.apps.app.githubLink.get.useSuspenseQuery(appId);

  const hasGithubLink = useMemo(() => {
    return githubLink !== null;
  }, [githubLink]);

  const hasProfilePicture = useMemo(() => {
    return app.profilePictureUrl !== null;
  }, [app.profilePictureUrl]);

  const hasDescription = useMemo(() => {
    return app.description !== null;
  }, [app.description]);

  const hasVisibility = useMemo(() => {
    return app.isPublic !== null;
  }, [app.isPublic]);

  const completedSteps = useMemo(() => {
    return [hasGithubLink, hasProfilePicture, hasDescription, hasVisibility];
  }, [hasGithubLink, hasProfilePicture, hasDescription, hasVisibility]);

  const allStepsCompleted = useMemo(() => {
    return completedSteps.every(Boolean);
  }, [completedSteps]);

  return {
    hasGithubLink,
    hasProfilePicture,
    hasDescription,
    hasVisibility,
    allStepsCompleted,
    githubLink,
    app,
  };
};
