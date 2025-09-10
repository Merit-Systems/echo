import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Route } from 'next';
import { ChevronRight } from 'lucide-react';
import { Suspense } from 'react';

interface Props<T extends string> {
  title: string;
  subtitle?: string | Promise<string>;
  link?: Route<T>;
  children: React.ReactNode;
}

export const OverviewCard = <T extends string>({
  title,
  subtitle,
  link,
  children,
}: Props<T>) => {
  return (
    <Card>
      {link ? (
        <Link href={link}>
          <Header title={title} subtitle={subtitle} />
        </Link>
      ) : (
        <Header title={title} subtitle={subtitle} />
      )}
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
};

const Header = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string | Promise<string>;
}) => {
  return (
    <CardHeader className="flex flex-row justify-between items-center group">
      <CardTitle className="text-lg mb-0">
        <span className="shrink-0">{title}</span>
        {subtitle && (
          <span className="text-muted-foreground/60 text-sm ml-2 font-normal">
            {typeof subtitle === 'string' ? (
              subtitle
            ) : (
              <Suspense fallback={null}>
                <AwaitedSubtitle subtitle={subtitle} />
              </Suspense>
            )}
          </span>
        )}
      </CardTitle>
      <div className="flex items-center gap-2 bg-muted/0 group-hover:bg-muted rounded-md p-1 transition-colors hover:scale-105">
        <ChevronRight className="size-4 text-muted-foreground/60 group-hover:text-muted-foreground" />
      </div>
    </CardHeader>
  );
};

const AwaitedSubtitle = async ({ subtitle }: { subtitle: Promise<string> }) => {
  return await subtitle;
};
