import { AuroraText } from '@/components/magicui/aurora-text';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Section } from '../lib/section';
import Link from 'next/link';
import type { Route } from 'next';
import { AppDemos } from './app-demos/index';

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
            User Pays AI SDK
          </h1>
        </div>
        {/* <p className={cn('text-center max-w-sm', dashedBorder)}>
          $0 down. Production ready in minutes.
        </p>
        <p className={cn('text-center max-w-sm', dashedBorder)}>
          No API keys. Never front API costs.
        </p> */}
        <p className={cn('text-center max-w-sm', dashedBorder)}>
          Your users pay as they go. You never front the bill.
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
        {/* <div className="mt-8 flex justify-center w-full">
          <HeroGraphic />
        </div> */}
        <div className="mt-8 w-full">
          <AppDemos />
        </div>
      </div>
    </Section>
  );
};
