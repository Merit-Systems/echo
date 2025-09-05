import { UserTransactionDetails } from '@/app/(app)/@authenticated/admin/_components';

interface PageProps {
  params: Promise<{ userId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminUserTransactionsPage({ params }: PageProps) {
  const { userId } = await params;
  return (
    <div className="container mx-auto py-8">
      <UserTransactionDetails userId={userId} />
    </div>
  );
}
