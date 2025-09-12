'use client';

import React, { useRef } from 'react';

import Image from 'next/image';

import { Logo } from '@/components/ui/logo';
import { Marquee } from '@/components/magicui/marquee';

import { Users } from 'lucide-react';

import { cn, formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { AnimatedBeam } from '@/components/magicui/animated-beam';
import { useIsMobile } from '@/hooks/use-is-mobile';

export const Coupon: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<HTMLDivElement>(null);
  const target1Ref = useRef<HTMLDivElement>(null);
  const target2Ref = useRef<HTMLDivElement>(null);
  const target3Ref = useRef<HTMLDivElement>(null);
  const target4Ref = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile(false);

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center relative w-full gap-16"
    >
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={sourceRef}
        toRef={target1Ref}
        duration={6}
        isVertical
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={sourceRef}
        toRef={target2Ref}
        duration={6}
        isVertical
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={sourceRef}
        toRef={target3Ref}
        duration={6}
        isVertical
      />
      {isMobile && (
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={sourceRef}
          toRef={target4Ref}
          duration={6}
          isVertical
        />
      )}
      <div
        className={cn(
          'relative mx-auto max-w-md overflow-hidden w-full',
          'bg-gradient-to-br from-primary via-primary/80 to-primary',
          'rounded-2xl'
        )}
      >
        <div className="absolute inset-0 rounded-2xl shadow-[inset_0_8px_32px_0_rgba(0,0,0,0.18)] pointer-events-none z-19" />
        <div className="p-6 flex flex-col gap-2 text-white">
          <div className="flex justify-between items-center">
            <p className="text-5xl font-bold text-white">
              {formatCurrency(1812.67, { notation: 'standard' })}
            </p>
            <Logo className="size-12" />
          </div>
          <p className="text-sm text-white font-semibold">
            Your Universal Balance for LLM Access
          </p>
        </div>
        <div className="-mx-2 flex items-center justify-center w-[calc(100%+1rem)] py-2">
          <div className="rounded-full size-4 bg-background z-20" />
          <svg className="flex-1 h-[2px] z-20">
            <line
              x1="0"
              y1="0"
              x2="100%"
              y2="0"
              pathLength="100"
              stroke="var(--background)"
              strokeWidth="2"
              strokeDasharray="2 1.5"
            />
          </svg>
          <div className="rounded-full size-4 bg-background z-20" />
        </div>

        <Marquee className="pb-4 pt-2">
          {[
            'anthropic',
            'openai',
            'google',
            'meta',
            'nous',
            'xai',
            'microsoft',
            'deepseek',
            'qwen',
          ].map((icon, index) => (
            <Image
              key={icon.toString() + index}
              className="size-6 text-white"
              src={`/icons/${icon}.svg`}
              alt={`${icon} logo`}
              width={24}
              height={24}
              style={{ filter: 'invert(1) brightness(2)' }}
            />
          ))}
        </Marquee>

        {/* Animated shimmer overlay */}
        <style>
          {`
          .animate-coupon-shimmer {
            animation: coupon-shimmer 5s infinite;
          }

          @keyframes coupon-shimmer {
            0% {
              transform: translateX(-400%);
              animation-timing-function: ease-in-out;
            }
            33% {
              transform: translateX(-400%);
              animation-timing-function: ease-in-out;
            }
            66% {
              transform: translateX(400%);
              animation-timing-function: ease-in-out;
            }
            100% {
              transform: translateX(400%);
              animation-timing-function: ease-in-out;
            }
          }
        `}
        </style>
        <div className="absolute top-[-100%] bottom-[-100%] w-[25%] bg-gradient-to-r from-transparent via-white/5 to-transparent animate-coupon-shimmer rounded-3xl rotate-30 pointer-events-none" />
        <div className="absolute left-0 right-0 bottom-0 h-2" ref={sourceRef} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
        <Card ref={target1Ref} className="z-10">
          <AppCard {...cards[0]} />
        </Card>
        <Card ref={target2Ref} className="z-10">
          <AppCard {...cards[1]} />
        </Card>
        <Card ref={target3Ref} className="z-10">
          <AppCard {...cards[2]} />
        </Card>
        <Card ref={target4Ref} className="z-10 block md:hidden">
          <AppCard {...cards[3]} />
        </Card>
      </div>
    </div>
  );
};

interface AppCardProps {
  image: string;
  title: string;
  author: string;
  description: string;
  earnings: number;
  users: number;
}

const AppCard: React.FC<AppCardProps> = ({
  image,
  title,
  description,
  author,
  earnings,
  users,
}) => {
  return (
    <div className="flex flex-col gap-2 p-2 size-full">
      <div className="flex items-center gap-2">
        <Image
          src={image}
          alt={title}
          width={20}
          height={20}
          className="size-6"
        />
        <div>
          <h3 className="font-bold">{title}</h3>
          <p className="text-xs text-muted-foreground font-semibold">
            {author}
          </p>
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

const cards: AppCardProps[] = [
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
    description: "An improved fork of Vercel's OSS vibe coding app",
    author: 'Sam Ragsdale',
    earnings: 348.63,
    users: 488,
  },
  {
    image: '/images/nano.png',
    title: 'EchoBanana',
    description: "Generate images using Google's new Nano Banana model",
    author: 'Sam Ragsdale',
    earnings: 569.63,
    users: 108,
  },
];
