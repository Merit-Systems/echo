'use client';

import React, { useEffect, useMemo, useState } from 'react';

import Link from 'next/link';

import { Check, ChevronsLeftRightEllipsis } from 'lucide-react';

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

import { TemplateGroup } from './template-group';

import { TEMPLATES } from './data';

import { api } from '@/trpc/client';

import { cn } from '@/lib/utils';
import type { Route } from 'next';
import { Button } from '@/components/ui/button';
import {
  SiNextdotjs,
  SiReact,
  SiTypescript,
} from '@icons-pack/react-simple-icons';
import { CopyCode } from '@/components/ui/copy-code';

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
  const [numApiKeys] = api.user.apiKeys.count.useSuspenseQuery(
    { appId },
    {
      refetchInterval: shouldRefetch ? 2500 : undefined,
    }
  );

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
          Create your App
        </div>
      </AccordionTrigger>
      <AccordionContent className="flex flex-col gap-2 md:gap-4">
        <Card className="overflow-hidden">
          <CardHeader className="border-b space-y-0.5 bg-muted">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Guided Setup</CardTitle>
              <Badge variant="glass" className="rounded-full">
                Recommended
              </Badge>
            </div>
            <CardDescription>
              Use one of our starter templates to get started with your app.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <TemplateGroup templateGroup={TEMPLATES} appId={appId} index={0} />
          </CardContent>
        </Card>
        <div className="flex gap-2 items-center">
          <Separator className="flex-1" />
          <p className="text-muted-foreground">or</p>
          <Separator className="flex-1" />
        </div>
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted flex flex-col md:flex-row justify-between space-y-0 items-start md:items-center gap-1 md:gap-4">
            <div className="flex flex-col gap-1">
              <CardTitle>
                Building from Scratch or Adding to an Existing App?
              </CardTitle>
              <CardDescription className="text-xs">
                Visit our{' '}
                <Link
                  href={'/docs' as Route}
                  target="_blank"
                  className="text-primary underline font-medium"
                >
                  docs
                </Link>{' '}
                for more details on our SDKs.
              </CardDescription>
            </div>
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar py-1">
              {[
                {
                  href: '/docs/next-sdk',
                  icon: <SiNextdotjs className="size-4" />,
                  label: 'Next.js SDK',
                },
                {
                  href: '/docs/react-sdk',
                  icon: <SiReact className="size-4" />,
                  label: 'React SDK',
                },
                {
                  href: '/docs/typescript-sdk',
                  icon: <SiTypescript className="size-4" />,
                  label: 'TypeScript SDK',
                },
              ].map(({ href, icon, label }) => (
                <Link
                  href={href as Route<'/docs/[sdk]'>}
                  target="_blank"
                  key={href}
                  className="h-fit"
                >
                  <Button variant="outline" size="sm">
                    {icon} {label}
                  </Button>
                </Link>
              ))}
            </div>
          </CardHeader>
          <div className="flex flex-col gap-1 p-4">
            <h3 className="text-sm font-medium">Your App ID</h3>
            <CopyCode
              code={appId}
              toastMessage="Copied to clipboard"
              className="border-primary"
            />
          </div>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
};
