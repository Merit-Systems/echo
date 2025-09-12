import Link from 'next/link';
import { Section } from '../lib/section';
import { BillingSectionCharts } from './charts';
import { Button } from '@/components/ui/button';

export const BillingSection = () => {
  return (
    <Section id="billing">
      <div className="p-4 md:p-8 flex flex-col items-center justify-center gap-8">
        <div className="flex flex-col items-center justify-center gap-2">
          <h1 className="text-2xl font-bold text-center">
            Revenue on Every Token
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            When once you set a markup, every token your users consume on your
            app is instant revenue.
          </p>
          <Link href="/login?redirect_url=/new">
            <Button variant="turbo" className="mt-2">
              Create an App
            </Button>
          </Link>
        </div>
        <BillingSectionCharts />
      </div>
    </Section>
  );
};
