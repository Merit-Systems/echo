import { cn } from '@/lib/utils';
import * as motion from 'motion/react-client';

import { usePathname } from 'next/navigation';
import { forwardRef } from 'react';

interface Props {
  href: string;
  children: React.ReactNode;
  subRoutes?: string[];
}

export const MotionTab = forwardRef<HTMLLIElement, Props>(
  ({ href, children, subRoutes }, ref) => {
    const pathname = usePathname();

    const isSelected =
      pathname === href ||
      (subRoutes?.some(route => pathname === route));

    return (
      <motion.li key={href} ref={ref}>
        <div
          className={cn(
            'relative py-1.5 px-4 text-muted-foreground/80 hover:text-foreground font-medium',
            isSelected && 'text-foreground font-bold'
          )}
        >
          {children}
        </div>
        {isSelected ? (
          <motion.div
            className="absolute bottom-[-1px] right-0 left-0 h-[2px] bg-primary rounded-full z-10"
            layoutId="underline"
            id="underline"
            transition={{
              type: 'tween',
              ease: 'easeOut',
              duration: 0.15,
            }}
          />
        ) : null}
      </motion.li>
    );
  }
);

MotionTab.displayName = 'MotionTab';
