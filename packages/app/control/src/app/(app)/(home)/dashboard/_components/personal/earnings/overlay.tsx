'use client';

import React, { use } from 'react';

import { Lock } from 'lucide-react';

import { AnimatePresence, motion } from 'motion/react';

import Link from 'next/link';

import { Button } from '@/components/ui/button';

interface Props {
  numAppsPromise: Promise<number>;
}

export const ActivityOverlay: React.FC<Props> = ({ numAppsPromise }) => {
  const numApps = use(numAppsPromise);

  return (
    <AnimatePresence>
      {numApps === 0 && (
        <motion.div
          className="absolute inset-0 bg-card/60 z-50 flex flex-col gap-3 items-center justify-center backdrop-blur-xs"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Lock className="size-12 text-primary" />
          <p className="text-base font-medium text-center max-w-xs text-muted-foreground">
            Create your first app to start earning
          </p>
          <Link href="/new">
            <Button variant="turbo">Create App</Button>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
