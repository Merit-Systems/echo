import { auth } from '@/auth';
import {
  Hero,
  Features,
  IntegrationSection,
  BillingSection,
  UniversalBalanceSection,
  End,
} from './_components';
import { redirect } from 'next/navigation';

export default async function LandingPage() {
  if (await auth()) {
    return redirect('/dashboard');
  }

  return (
    <div className="max-w-4xl mx-auto w-full">
      <End />
      <Hero />
      <Features />
      <IntegrationSection />
      <BillingSection />
      <UniversalBalanceSection />
      <End className="border-t" />
    </div>
  );
}
