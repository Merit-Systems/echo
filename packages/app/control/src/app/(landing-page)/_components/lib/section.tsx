import { dashedBorder } from './utils';

import { cn } from '@/lib/utils';

interface Props {
  children: React.ReactNode;
  id: string;
  className?: string;
}

export const Section: React.FC<Props> = ({ children, id, className }) => {
  return (
    <section
      id={id}
      className={cn('w-full max-w-full overflow-hidden', className)}
    >
      <div className="flex w-full max-w-full overflow-hidden">
        <div className={cn('w-4 md:w-8 border-t shrink-0', dashedBorder)} />
        <div
          className={cn(
            'flex-1 border-x border-t overflow-hidden',
            dashedBorder
          )}
        >
          {children}
        </div>
        <div className={cn('w-4 md:w-8 border-t shrink-0', dashedBorder)} />
      </div>
    </section>
  );
};

interface EndProps {
  className?: string;
}

export const End: React.FC<EndProps> = ({ className }) => {
  return (
    <div
      className={cn('h-16 border-x mx-4 md:mx-8', dashedBorder, className)}
    />
  );
};
