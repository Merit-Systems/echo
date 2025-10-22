import { cn } from '@/lib/utils';

export const FeatureCard = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className={cn(
        'gap-4 p-4 pt-8 md:pt-4 flex flex-col',
        'border-b last:border-b-0',
        'md:border-r md:[&:nth-child(2n)]:border-r-0',
        'md:[&:nth-child(n+3)]:border-b-0',
        'border-dashed border-border'
      )}
    >
      {children}
    </div>
  );
};

export const FeatureCardComponent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        'flex w-full flex-1 items-center justify-start overflow-hidden'
      )}
    >
      {children}
    </div>
  );
};

export const FeatureCardFooter = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col w-full items-start gap-0">{children}</div>
  );
};

export const FeatureCardTitle = ({ children }: { children: string }) => {
  return <h2 className="text-lg font-bold">{children}</h2>;
};

export const FeatureCardDescription = ({ children }: { children: string }) => {
  return <p className="text-muted-foreground/80 text-sm">{children}</p>;
};
