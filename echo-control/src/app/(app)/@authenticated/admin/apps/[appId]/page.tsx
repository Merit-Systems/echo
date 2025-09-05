import { AppTransactionDetails } from '@/app/(app)/@authenticated/admin/_components';

interface PageProps {
  params: Promise<{ appId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminAppTransactionsPage({ params }: PageProps) {
  const { appId } = await params;
  return (
    <div className="container mx-auto py-8">
      <AppTransactionDetails appId={appId} />
    </div>
  );
}
