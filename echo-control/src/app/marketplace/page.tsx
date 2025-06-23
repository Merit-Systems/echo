import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import MarketplacePage from '@/components/MarketplacePage';

export default async function Marketplace() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            App Marketplace
          </h1>
          <p className="mt-2 text-muted-foreground">
            Discover and join Echo applications to start using AI services.
          </p>
        </div>
        <MarketplacePage />
      </div>
    </main>
  );
}
