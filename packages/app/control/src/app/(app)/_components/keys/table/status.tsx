import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface Props {
  isArchived: boolean;
}

export const KeyStatus: React.FC<Props> = ({ isArchived }) => {
  const statusClassNames = isArchived
    ? 'text-red-600 border-red-600 bg-red-600/10'
    : 'text-green-600 border-green-600 bg-green-600/10';

  return (
    <div
      className={cn(
        'border px-2 py-1 rounded-md text-xs font-semibold capitalize w-fit',
        statusClassNames
      )}
    >
      {isArchived ? 'Archived' : 'Active'}
    </div>
  );
};

export const LoadingKeyStatus = () => {
  return (
    <div className="border px-2 py-1 rounded-md text-xs font-semibold capitalize w-fit">
      <Skeleton className="h-4 w-16" />
    </div>
  );
};
