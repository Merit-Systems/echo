import { cn } from '@/lib/utils';
import { CopyButton } from './copy-button';
import { Skeleton } from './skeleton';

type Props = {
  className?: string;
} & (
  | {
      isLoading: true;
    }
  | {
      isLoading?: false;
      code: string;
      toastMessage: string;
      className?: string;
    }
);

export const CopyCode: React.FC<Props> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        'flex items-center w-full border rounded-md overflow-hidden pl-2 pr-1 py-1 bg-muted',
        className
      )}
    >
      {props.isLoading ? (
        <Skeleton className="h-5 flex-1" />
      ) : (
        <p className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-sm no-scrollbar pr-2">
          {props.code}
        </p>
      )}

      <CopyButton
        text={props.isLoading ? '' : props.code}
        toastMessage={props.isLoading ? '' : props.toastMessage}
        isLoading={props.isLoading}
      />
    </div>
  );
};
