'use client';

import React, { useEffect, useMemo, useState } from 'react';

import Link from 'next/link';

import { SiNextdotjs, SiReact } from '@icons-pack/react-simple-icons';

import {
  Tabs,
  TabsTrigger,
  TabsList,
  TabsContent,
  TabsContents,
} from '@/components/ui/shadcn-io/tabs';

import { Card } from '@/components/ui/card';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { api } from '@/trpc/client';
import { Check, ChevronsLeftRightEllipsis } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CopyButton } from '@/components/ui/copy-button';
import { ReactTemplateSelector, NextTemplateSelector } from './template-select';

interface Props {
  appId: string;
}

export const Connection: React.FC<Props> = ({ appId }) => {
  const [shouldRefetch, setShouldRefetch] = useState(true);

  const [numTokens] = api.apps.app.getNumTokens.useSuspenseQuery(
    { appId },
    {
      refetchInterval: shouldRefetch ? 2500 : undefined,
    }
  );
  const [numApiKeys] = api.user.apiKeys.count.useSuspenseQuery({ appId });

  const isConnected = useMemo(() => {
    return numTokens > 0 || numApiKeys > 0;
  }, [numTokens, numApiKeys]);

  useEffect(() => {
    setShouldRefetch(!isConnected);
  }, [isConnected]);

  return (
    <AccordionItem value="connection" className="border-none">
      <AccordionTrigger className="text-lg font-semibold pt-0">
        <div
          className={cn(
            'flex items-center gap-2',
            isConnected && 'text-primary'
          )}
        >
          {isConnected ? (
            <Check className="size-4" />
          ) : (
            <ChevronsLeftRightEllipsis className="size-4" />
          )}
          Connect to Echo
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <Tabs className="flex flex-col gap-2" defaultValue="next">
          <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
            <TabsList className="rounded-lg">
              <TabsTrigger value="next" className="px-8 gap-2 rounded-lg">
                <SiNextdotjs className="size-4" />
                Next.js
              </TabsTrigger>
              <TabsTrigger value="react" className="px-8 gap-2 rounded-lg">
                <SiReact className="size-4" />
                React
              </TabsTrigger>
            </TabsList>
            <div className="flex flex-col items-start md:items-end mt-2 md:mt-0">
              <p className="text-[10px] text-muted-foreground">Your App ID</p>
              <div className="flex items-center w-fit border border-primary rounded-md overflow-hidden pl-2 pr-1 py-1 bg-muted">
                <p className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-xs no-scrollbar pr-2">
                  {appId}
                </p>
                <CopyButton
                  text={appId}
                  toastMessage="Copied to clipboard"
                  className="shadow-none p-1"
                />
              </div>
            </div>
          </div>
          <TabsContents className="max-h-[70vh] md:h-[354px] overflow-y-auto no-scrollbar">
            <TabsContent value="next" className="gap-2 flex flex-col">
              <Card className="flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x">
                <NextTemplateSelector appId={appId} />
              </Card>
              <p className="text-sm text-muted-foreground">
                For more detailed instructions, see our{' '}
                <Link
                  href="/docs/getting-started/next-js"
                  className="text-primary underline font-medium"
                  target="_blank"
                >
                  Next.js docs
                </Link>
              </p>
            </TabsContent>
            <TabsContent value="react" className="gap-2 flex flex-col">
              <Card className="flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x">
                <ReactTemplateSelector appId={appId} />
              </Card>
              <p className="text-sm text-muted-foreground">
                For more detailed instructions, see our{' '}
                <Link
                  href="/docs/getting-started/react"
                  className="text-primary underline font-medium"
                  target="_blank"
                >
                  React docs
                </Link>
              </p>
            </TabsContent>
          </TabsContents>
        </Tabs>
      </AccordionContent>
    </AccordionItem>
  );
};
