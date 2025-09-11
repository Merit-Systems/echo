'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';

interface Props<T extends string> {
  children: React.ReactNode;
  href: Route<T>;
  appId: string;
}

export const AppSettingsSidebarButton = <T extends string>({
  children,
  href,
  appId,
}: Props<T>) => {
  const pathname = usePathname();

  return (
    <Button
      variant="ghost"
      className={cn(
        'w-full justify-start text-base',
        pathname === href ||
          (href === `/app/${appId}/settings/general` &&
            pathname === `/app/${appId}/settings`)
          ? 'text-foreground font-medium'
          : 'text-muted-foreground/80 font-normal'
      )}
    >
      {children}
    </Button>
  );
};
