import Link from 'next/link';
import { Section } from '../lib/section';
import { Coupon } from './coupon';
import { Button } from '@/components/ui/button';

export const UniversalBalanceSection = () => {
  return (
    <Section id="universal-balance">
      <div className="p-4 md:p-8 flex flex-col items-center justify-center gap-8">
        <div className="flex flex-col items-center justify-center gap-2">
          <h1 className="text-2xl font-bold text-center">
            One Balance, Every Model, Every App
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            Your Echo balance is shared across all Echo-powered apps. Pay once,
            use everywhere.
          </p>
          <Link href="/login">
            <Button variant="turbo" className="mt-2">
              Get Started
            </Button>
          </Link>
        </div>
        <Coupon />
      </div>
    </Section>
  );
};
