'use client';

import { Sun, Moon, Laptop } from 'lucide-react';

import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const ColorModeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2 text-left text-sm">
      {[
        { theme: 'light' as const, Icon: Sun },
        { theme: 'dark' as const, Icon: Moon },
        { theme: 'system' as const, Icon: Laptop },
      ].map(({ theme: themeOption, Icon }) => (
        <Button
          key={themeOption}
          variant="ghost"
          onClick={() => setTheme(themeOption)}
          className={cn(
            'size-fit md:size-fit p-1 hover:bg-foreground/10 shrink-0',
            theme === themeOption && 'bg-foreground/10 hover:bg-foreground/20'
          )}
        >
          <Icon className="size-4" />
        </Button>
      ))}
    </div>
  );
};
