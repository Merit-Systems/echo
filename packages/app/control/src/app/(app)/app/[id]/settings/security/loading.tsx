import { Skeleton } from '@/components/ui/skeleton';
import { FormCard } from '../_components/form/card';

export default function LoadingSecuritySettingsPage() {
  return (
    <FormCard
      title="Authorized Callbacks"
      description="The URLs that are authorized to receive OAuth callbacks."
      docsUrl="/docs/security"
      isLoading={true}
    >
      <Skeleton className="h-9 w-full mb-2" />
    </FormCard>
  );
}
