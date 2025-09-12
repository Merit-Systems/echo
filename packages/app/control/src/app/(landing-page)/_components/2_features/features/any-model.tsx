'use client';

import React, { useRef } from 'react';

import { Plus } from 'lucide-react';
import {
  SiAnthropic,
  SiOpenai,
  SiGooglegemini,
} from '@icons-pack/react-simple-icons';

import { Logo } from '@/components/ui/logo';

import { AnimatedBeam, Circle } from '@/components/magicui/animated-beam';

const iconProps = {
  className: 'size-4',
};

export const AnyModel: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<HTMLDivElement>(null);
  const target1Ref = useRef<HTMLDivElement>(null);
  const target2Ref = useRef<HTMLDivElement>(null);
  const target3Ref = useRef<HTMLDivElement>(null);
  const target4Ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center relative w-full gap-8"
    >
      <Circle ref={sourceRef} className="p-4 size-fit">
        <Logo className="size-8" />
      </Circle>
      <div className="flex w-full justify-between">
        <Circle ref={target1Ref}>
          <SiOpenai {...iconProps} />
        </Circle>
        <Circle ref={target2Ref}>
          <SiAnthropic {...iconProps} />
        </Circle>
        <Circle ref={target3Ref}>
          <SiGooglegemini {...iconProps} />
        </Circle>
        <Circle ref={target4Ref}>
          <Plus {...iconProps} />
        </Circle>
      </div>

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
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={sourceRef}
        toRef={target4Ref}
        duration={6}
        isVertical
      />
    </div>
  );
};
