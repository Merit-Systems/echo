'use client';

import React, { useRef } from 'react';

import { AppWindow, User } from 'lucide-react';

import { AnimatedBeam } from '@/components/magicui/animated-beam';

import { UserAvatar } from '@/components/utils/user-avatar';
import { Card } from '@/components/ui/card';

interface Props {
  appImage: string | null | undefined;
  userImage: string | null | undefined;
}

export const ConnectionBeam: React.FC<Props> = ({ appImage, userImage }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);

  return (
    <div
      className="relative flex w-full items-center justify-center overflow-hidden max-w-xs"
      ref={containerRef}
    >
      <div className="flex size-full flex-col items-stretch justify-between gap-10">
        <div className="flex flex-row justify-between">
          <Item
            ref={div1Ref}
            src={appImage}
            fallback={<AppWindow className="size-8" />}
          />
          <Item
            ref={div2Ref}
            src={userImage}
            fallback={<User className="size-8" />}
          />
        </div>
      </div>

      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div2Ref}
        startYOffset={10}
        endYOffset={10}
        curvature={-20}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div2Ref}
        startYOffset={-10}
        endYOffset={-10}
        curvature={20}
        reverse
      />
    </div>
  );
};

const Item = React.forwardRef<
  HTMLDivElement,
  { src: string | null | undefined; fallback: React.ReactNode }
>(({ src, fallback }, ref) => {
  return (
    <Card ref={ref} className="z-10 size-16 overflow-hidden rounded-md">
      <UserAvatar src={src} fallback={fallback} />
    </Card>
  );
});
Item.displayName = 'Item';
