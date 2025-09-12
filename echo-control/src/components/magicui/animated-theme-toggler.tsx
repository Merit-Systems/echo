'use client';

import { Moon, Sun } from 'lucide-react';
import { useRef } from 'react';
import { flushSync } from 'react-dom';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { Button } from '../ui/button';

type props = {
  className?: string;
};

export const AnimatedThemeToggler = ({ className }: props) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const { resolvedTheme, setTheme } = useTheme();
  const changeTheme = async () => {
    if (!buttonRef.current) return;

    const next = resolvedTheme === 'dark' ? 'light' : 'dark';

    if (!('startViewTransition' in document)) {
      setTheme(next);
    } else {
      await (document as any).startViewTransition(() => {
        flushSync(() => {
          setTheme(next);
        });
      }).ready;
    }

    const { top, left, width, height } =
      buttonRef.current.getBoundingClientRect();
    const y = top + height / 2;
    const x = left + width / 2;

    const right = window.innerWidth - left;
    const bottom = window.innerHeight - top;
    const maxRad = Math.hypot(Math.max(left, right), Math.max(top, bottom));

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRad}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 700,
        easing: 'ease-in-out',
        pseudoElement: '::view-transition-new(root)',
      }
    );
  };
  return (
    <Button
      ref={buttonRef}
      onClick={changeTheme}
      className={cn(className)}
      size="icon"
      variant="outline"
    >
      <Sun className="absolute size-4 rotate-0 opacity-100 transition-all duration-300 dark:-rotate-90 dark:opacity-0" />
      <Moon className="absolute size-4 rotate-90 opacity-0 transition-all duration-300 dark:rotate-0 dark:opacity-100" />
    </Button>
  );
};
