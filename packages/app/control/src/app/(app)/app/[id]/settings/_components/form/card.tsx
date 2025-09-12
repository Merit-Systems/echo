import { ExternalLink } from 'lucide-react';

import Link from 'next/link';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { FormButton } from './button';

import type { Route } from 'next';
import { Skeleton } from '@/components/ui/skeleton';

interface Props<DocsUrl extends string> {
  title: string;
  description: string;
  children: React.ReactNode;
  docsUrl?: Route<DocsUrl>;
  isLoading?: boolean;
  hideSaveButton?: boolean;
}

export const FormCard = <DocsUrl extends string>({
  title,
  description,
  children,
  docsUrl,
  isLoading,
  hideSaveButton,
}: Props<DocsUrl>) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
      {(!hideSaveButton || docsUrl) && (
        <CardFooter className="border-t bg-muted py-3 px-4 flex justify-between">
          {docsUrl ? (
            <p className="text-sm text-muted-foreground opacity-80">
              Learn more about{' '}
              <Link
                href={docsUrl}
                className="inline-flex items-center gap-1 underline text-foreground font-semibold"
              >
                {title} <ExternalLink className="w-4 h-4" />
              </Link>
            </p>
          ) : (
            <div />
          )}
          {!hideSaveButton && isLoading ? (
            <Skeleton className="h-9 w-16" />
          ) : (
            <FormButton />
          )}
        </CardFooter>
      )}
    </Card>
  );
};
