'use client';

import { useEffect, useMemo, useState } from 'react';

import { AnimatePresence, motion } from 'motion/react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

import { AppDetails } from './app-details';

import { api } from '@/trpc/client';
import { Connection } from './connection';
import { Accordion } from '@/components/ui/accordion';
import { GenerateText } from './generate-text';
import { cn } from '@/lib/utils';
import type {
  Highlighter} from '@/components/ui/code/shiki.bundle';
import {
  getSingletonHighlighter
} from '@/components/ui/code/shiki.bundle';
import { createJavaScriptRegexEngine } from '@shikijs/engine-javascript';
import { HighlighterProvider } from './lib/highlighter-context';

interface Props {
  appId: string;
}

export const Setup: React.FC<Props> = ({ appId }) => {
  const [app] = api.apps.app.get.useSuspenseQuery({ appId });
  const [githubLink] = api.apps.app.githubLink.get.useSuspenseQuery(appId);
  const [numTokens] = api.apps.app.getNumTokens.useSuspenseQuery({ appId });
  const [numTransactions] = api.apps.app.transactions.count.useSuspenseQuery({
    appId,
  });
  const [numApiKeys] = api.user.apiKeys.count.useSuspenseQuery({ appId });
  const [isOwner] = api.apps.app.isOwner.useSuspenseQuery(appId);

  const [highlighter, setHighlighter] = useState<Highlighter | null>(null);

  useEffect(() => {
    void getSingletonHighlighter({
      langs: ['tsx', 'shell'],
      themes: ['github-light', 'github-dark'],
      engine: createJavaScriptRegexEngine(),
    }).then(setHighlighter);
  }, []);

  const appDetailsSteps = useMemo(
    () => [
      app.profilePictureUrl !== null,
      app.description !== null,
      githubLink !== null,
    ],
    [app.profilePictureUrl, app.description, githubLink]
  );

  const connectionSteps = useMemo(
    () => [numTokens > 0 || numApiKeys > 0],
    [numTokens, numApiKeys]
  );

  const generateTextSteps = useMemo(
    () => [numTransactions > 0],
    [numTransactions]
  );

  const steps = [...appDetailsSteps, ...connectionSteps, ...generateTextSteps];

  const completedSteps = steps.filter(Boolean).length;
  const allStepsCompleted = completedSteps === steps.length;

  const [isComplete, setIsComplete] = useState(allStepsCompleted);

  const [accordionValue, setAccordionValue] = useState<string>(
    !appDetailsSteps.every(Boolean)
      ? 'app-details'
      : !connectionSteps.every(Boolean)
        ? 'connection'
        : !generateTextSteps.every(Boolean)
          ? 'generate-text'
          : ''
  );

  useEffect(() => {
    // Compute completion states only once
    const appDetailsCompleted = appDetailsSteps.every(Boolean);
    const connectionCompleted = connectionSteps.every(Boolean);
    const generateTextCompleted = generateTextSteps.every(Boolean);

    let nextAccordionValue = '';

    if (!appDetailsCompleted) {
      nextAccordionValue = 'app-details';
    } else if (!connectionCompleted) {
      nextAccordionValue = 'connection';
    } else if (!generateTextCompleted) {
      nextAccordionValue = 'generate-text';
    }

    if (nextAccordionValue !== '') {
      setAccordionValue(prev =>
        prev === nextAccordionValue ? prev : nextAccordionValue
      );
    }
  }, [appDetailsSteps, connectionSteps, generateTextSteps]);

  return (
    <AnimatePresence mode="wait">
      {!isComplete && highlighter && isOwner && (
        <HighlighterProvider highlighter={highlighter}>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                opacity: { delay: 0.1, duration: 0.2 },
                height: { duration: 0.2 },
              },
            }}
            layout
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
            className="flex flex-col gap-4 h-full"
          >
            <div className="flex justify-between items-center gap-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold">Set Up Your App</h1>
                </div>
                <p className="text-muted-foreground">
                  Complete the following steps to set up your app
                </p>
              </div>
              <div className="w-1/4 flex items-center gap-2">
                <div className="flex flex-col items-end gap-1 w-full">
                  <p className="text-sm text-muted-foreground font-bold shrink-0">
                    {(
                      ((completedSteps + 1) / (steps.length + 1)) *
                      100
                    ).toFixed(0)}
                    % Complete
                  </p>
                  <Progress
                    value={((completedSteps + 1) / (steps.length + 1)) * 100}
                  />
                </div>
              </div>
            </div>
            <Accordion
              type="single"
              collapsible
              value={accordionValue}
              onValueChange={setAccordionValue}
            >
              <AppDetails appId={appId} />
              <Connection appId={appId} />
              <GenerateText appId={appId} />
            </Accordion>
            <motion.div
              initial={{ opacity: 0, marginBottom: 0, height: 32 }}
              animate={{
                height: allStepsCompleted ? 48 : 32,
                opacity: allStepsCompleted ? 1 : 0,
                marginBottom: allStepsCompleted ? 32 : 0,
              }}
              exit={{
                height: 0,
                opacity: 0,
              }}
              className="h-8 mb-8"
            >
              <Button
                variant="turbo"
                className={cn(
                  'size-full text-lg font-bold',
                  !allStepsCompleted && 'pointer-events-none'
                )}
                onClick={
                  allStepsCompleted ? () => setIsComplete(true) : undefined
                }
              >
                Finish Setup
              </Button>
            </motion.div>
          </motion.div>
        </HighlighterProvider>
      )}
    </AnimatePresence>
  );
};
