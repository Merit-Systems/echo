import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import AppMarketplaceDetailPage from '@/components/AppMarketplaceDetailPage';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MarketplaceAppDetailPage({ params }: PageProps) {
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <AppMarketplaceDetailPage appId={id} />
      </div>
    </main>
  );
}
