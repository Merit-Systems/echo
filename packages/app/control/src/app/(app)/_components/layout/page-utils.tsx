import React, { ReactNode } from 'react';

import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface HeadingProps {
  title: string | ReactNode;
  icon?: ReactNode;
  description?: string;
  actions?: ReactNode;
}

export const Heading: React.FC<HeadingProps> = ({
  icon,
  title,
  description,
  actions,
}) => {
  return (
    <>
      <div className="flex items-center justify-between max-w-full md:max-w-6xl w-full px-2 pb-6 md:pb-8 mx-auto gap-4">
        <div className="flex items-center gap-4 shrink-0 flex-1">
          {icon}
          <div className="flex flex-col gap-3 text-left">
            {typeof title === 'string' ? (
              <h1 className="text-2xl md:text-4xl font-bold">{title}</h1>
            ) : (
              title
            )}
            {description && (
              <p className="text-muted-foreground/80">{description}</p>
            )}
          </div>
        </div>
        {actions}
      </div>
      <Separator />
    </>
  );
};

interface BodyProps {
  children: ReactNode;
  className?: string;
}

export const Body: React.FC<BodyProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'flex flex-col gap-8 max-w-6xl w-full mx-auto py-8 px-2',
        className
      )}
    >
      {children}
    </div>
  );
};
