import { HeroGraphic } from './graphic';
import { AuroraText } from '@/components/magicui/aurora-text';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Section } from '../lib/section';
import Link from 'next/link';
import type { Route } from 'next';

const dashedBorder = 'border-dashed border-border';

export const Hero = () => {
  return (
    <Section id="hero">
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-4 p-4 md:p-8'
        )}
      >
        <div className="flex flex-col gap-2 items-center justify-center">
          <h1 className="text-6xl font-extrabold">
            <AuroraText>Echo</AuroraText>
          </h1>
          <h1
            className={cn(
              'text-2xl md:text-3xl font-bold text-center',
              dashedBorder
            )}
          >
            Monetize AI Apps in Minutes
          </h1>
        </div>
        <p className={cn('text-center max-w-sm', dashedBorder)}>
          <p>
            Route & meter AI calls, <b>monetize</b>, and authenticate users with ~5 lines.
          </p>
          <br className="my-1" /> You set the markup, we handle the rest.
        </p>
        <div className={cn('flex justify-center gap-2')}>
          <Link href="/login?redirect_url=/new">
            <Button size="lg" variant="turbo">
              Create an App
            </Button>
          </Link>
          <Link href={'/docs' as Route}>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </Link>
        </div>
        <div className="mt-8 flex justify-center w-full">
          <HeroGraphic />
        </div>
      </div>
    </Section>
  );
};
