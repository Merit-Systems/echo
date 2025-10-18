import { AuroraText } from '@/components/magicui/aurora-text';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Section } from '../lib/section';
import Link from 'next/link';
import type { Route } from 'next';
import { HeroGraphic2 } from './graphic_2';

const dashedBorder = 'border-dashed border-border';

import Image from 'next/image';

import { Users } from 'lucide-react';

import { CardStack } from '@/components/ui/card-stack';

import { formatCurrency } from '@/lib/utils';
import { Logo } from '@/components/ui/logo';

export const Login = () => {
    return (
        <div className="size-full flex items-end justify-center">
            <div className="h-36 w-full">
                <CardStack
                    items={cards.map(card => ({
                        key: card.title,
                        content: <Card {...card} />,
                    }))}
                />
            </div>
        </div>
    );
};

const cards: CardProps[] = [
    {
        image: '/images/toolkit.svg',
        title: 'Toolkit.dev',
        description: 'Configurable tool-calling chatbot with generative UI',
        author: 'Jason Hedman',
        earnings: 156.78,
        users: 561,
    },
    {
        image: '/images/shirtslop.png',
        title: 'Shirtslop',
        description: 'Generate and print custom shirts from AI images',
        author: 'Ryan Sproule',
        earnings: 212.91,
        users: 123,
    },
    {
        image: '/images/vibes.png',
        title: 'EchoVibes',
        description: "An improved fork of Vercel's OSS vibe coding app.",
        author: 'Sam Ragsdale',
        earnings: 348.63,
        users: 488,
    },
];

interface CardProps {
    image: string;
    title: string;
    author: string;
    description: string;
    earnings: number;
    users: number;
}

const Card: React.FC<CardProps> = ({
    image,
    title,
    description,
    earnings,
    users,
}) => {
    return (
        <div className="flex flex-col gap-2 p-2 size-full">

            <div className="flex items-center gap-2 border-b pb-2 justify-between">
                <div className="flex gap-2">
                    <Image
                        src={image}
                        alt={title}
                        width={20}
                        height={20}
                        className="size-6"
                    />
                    <div>
                        <h3 className="font-bold">{title}</h3>
                    </div>
                </div>
                <div>

                    <button
                        className="inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-md text-xs md:text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed gap-2 active:shadow-none active:translate-y-[1px] border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-8 md:h-9 py-0.5 w-[96px] px-0.5"
                    >
                        <Logo className="size-4" />
                        <span className="text-xs">
                            Connect
                        </span>
                    </button>

                </div>
            </div>

            <p className="text-xs text-muted-foreground">{description}</p>
            <div className="flex items-center justify-between gap-2 mt-auto">
                <p className="text-xs text-primary font-bold">
                    {formatCurrency(earnings)}
                </p>
                <div className="flex items-center gap-1 text-muted-foreground">
                    <p className="text-xs">{users.toLocaleString()}</p>
                    <Users className="size-3" />
                </div>
            </div>
        </div>
    );
};


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
          <HeroGraphic2 />
        </div>
      </div>
    </Section>
  );
};
