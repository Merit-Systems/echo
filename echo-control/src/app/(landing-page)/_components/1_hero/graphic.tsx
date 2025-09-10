'use client';

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';

import {
  SiAnthropic,
  SiGooglegemini,
  SiOpenai,
} from '@icons-pack/react-simple-icons';
import { TrendingUp, User, Users } from 'lucide-react';

import NumberFlow from '@number-flow/react';

import { Card } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';

import { AnimatedBeam } from '@/components/magicui/animated-beam';

import { cn } from '@/lib/utils';

export const HeroGraphic = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const user1Ref = useRef<HTMLDivElement>(null);
  const user2Ref = useRef<HTMLDivElement>(null);
  const user3Ref = useRef<HTMLDivElement>(null);
  const echoLeftRef = useRef<HTMLDivElement>(null);
  const echoRightRef = useRef<HTMLDivElement>(null);
  const model1Ref = useRef<HTMLDivElement>(null);
  const model2Ref = useRef<HTMLDivElement>(null);
  const model3Ref = useRef<HTMLDivElement>(null);

  const cardClassName = 'flex flex-col items-center justify-center p-2 z-10';

  const beamDuration = 3;

  const [isReverse, setIsReverse] = useState(false);
  const [dollars, setDollars] = useState(1287.89);
  const [users, setUsers] = useState(652);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsReverse(prev => !prev);
    }, beamDuration * 1000);
    return () => clearInterval(interval);
  }, []);

  const getIncrease = (max: number, decimals = 0) =>
    Math.ceil(Math.random() * max * 10 ** decimals) / 10 ** decimals;

  useEffect(() => {
    const offset = 1250;
    let interval: NodeJS.Timeout;
    setTimeout(
      () => {
        setUsers(prev => prev + getIncrease(10));
        interval = setInterval(
          () => {
            setUsers(prev => prev + getIncrease(10));
          },
          beamDuration * 1000 * 2
        );
      },
      (beamDuration * 1000) / 2 - offset
    );
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const offset = 1250;
    let interval: NodeJS.Timeout;
    setTimeout(
      () => {
        setDollars(prev => prev + getIncrease(200, 2));
        interval = setInterval(
          () => {
            setDollars(prev => prev + getIncrease(200, 2));
          },
          beamDuration * 1000 * 2
        );
      },
      (beamDuration * 1000 * 3) / 2 - offset
    );
    return () => clearInterval(interval);
  }, []);

  const beamProps = {
    duration: beamDuration,
    reverse: isReverse,
  };

  const echoEndClassName = 'absolute h-full w-16';

  return (
    <div
      ref={containerRef}
      className="relative size-full flex items-center justify-between max-w-lg w-full"
    >
      <div className="flex flex-col gap-2">
        <Card className={cardClassName} ref={user1Ref}>
          <User className="size-6 md:size-8" />
        </Card>
        <Card className={cardClassName} ref={user2Ref}>
          <User className="size-6 md:size-8" />
        </Card>
        <Card className={cardClassName} ref={user3Ref}>
          <User className="size-6 md:size-8" />
        </Card>
      </div>
      <Card
        className={cn(
          cardClassName,
          'items-start gap-2 w-40 md:w-48 relative border-primary border-2 shadow-[0_0_10px] shadow-primary'
        )}
      >
        <div className={cn(echoEndClassName, 'left-0')} ref={echoLeftRef} />
        <div className="flex items-center justify-center gap-2">
          <Logo className="size-6 md:size-8" />
          <div className="flex flex-col items-start gap-1">
            <h1 className="text-base md:text-lg font-bold leading-none">
              Your App
            </h1>
            <p className="text-xs text-muted-foreground leading-none">
              Powered by Echo
            </p>
          </div>
        </div>
        <div className="flex flex-col items-start">
          <div className="flex items-center justify-center gap-1 text-primary font-bold text-xs md:text-sm">
            <TrendingUp className="size-3" />
            <NumberFlow
              value={dollars}
              format={{
                currency: 'USD',
                style: 'currency',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }}
            />
            <span>profit</span>
          </div>
          <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs md:text-sm">
            <Users className="size-3" />
            <NumberFlow value={users} />
            <span> users</span>
          </div>
        </div>
        <div className={cn(echoEndClassName, 'right-0')} ref={echoRightRef} />
      </Card>
      <div className="flex flex-col gap-2">
        <Card className={cardClassName} ref={model1Ref}>
          <SiOpenai className="size-6 md:size-8" />
        </Card>
        <Card className={cardClassName} ref={model2Ref}>
          <SiAnthropic className="size-6 md:size-8" />
        </Card>
        <Card className={cardClassName} ref={model3Ref}>
          <SiGooglegemini className="size-6 md:size-8" />
        </Card>
      </div>
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={user1Ref}
        toRef={echoLeftRef}
        {...beamProps}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={user2Ref}
        toRef={echoLeftRef}
        {...beamProps}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={user3Ref}
        toRef={echoLeftRef}
        {...beamProps}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={model1Ref}
        toRef={echoRightRef}
        {...beamProps}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={model2Ref}
        toRef={echoRightRef}
        {...beamProps}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={model3Ref}
        toRef={echoRightRef}
        {...beamProps}
      />
    </div>
  );
};
