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
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

import { TemplateGroup } from './template-group';

import { TEMPLATES } from './data';

import { api } from '@/trpc/client';

import { cn } from '@/lib/utils';
import { Route } from 'next';
import { Button } from '@/components/ui/button';
import {
  SiNextdotjs,
  SiReact,
  SiTypescript,
} from '@icons-pack/react-simple-icons';

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
          Create your App
        </div>
      </AccordionTrigger>
      <AccordionContent className="flex flex-col gap-2 md:gap-4">
        <Card>
          <CardHeader className="border-b space-y-0.5">
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
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Building from Scratch or Adding to an Existing App?
            </CardTitle>
            <CardDescription>
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
          </CardHeader>
          <CardFooter className="gap-2">
            <Link href={'/docs/next-sdk'} target="_blank">
              <Button variant="outline">
                <SiNextdotjs className="size-4" /> Next.js SDK Docs
              </Button>
            </Link>
            <Link href={'/docs/react-sdk'} target="_blank">
              <Button variant="outline">
                <SiReact className="size-4" /> React SDK Docs
              </Button>
            </Link>
            <Link href={'/docs/typescript-sdk'} target="_blank">
              <Button variant="outline">
                <SiTypescript className="size-4" /> TypeScript SDK Docs
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
};
