'use client';

import Link from 'next/link';

import { MotionTab } from './motion-tab';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react';
import { Route } from 'next';
import { ExternalLink } from 'lucide-react';

interface Tab<T extends string> {
  label: string;
  href: Route<T>;
  subRoutes?: string[];
  external?: boolean;
}

interface Props<T extends string = string> {
  tabs: Tab<T>[];
}

export const Nav = <T extends string>({ tabs }: Props<T>) => {
  const [buttonRefs, setButtonRefs] = useState<Array<HTMLAnchorElement | null>>(
    []
  );

  const { scrollY } = useScroll();

  const paddingLeft = useTransform(scrollY, [0, 56], [0, 36]);

  useEffect(() => {
    setButtonRefs(prev => prev.slice(0, tabs.length));
  }, [tabs.length]);

  const navRef = useRef<HTMLDivElement>(null);
  const navRect = navRef.current?.getBoundingClientRect();

  const [hoveredTabIndex, setHoveredTabIndex] = useState<number | null>(null);
  const hoveredRect =
    buttonRefs[hoveredTabIndex ?? -1]?.getBoundingClientRect();

  return (
    <div className="w-full max-w-full overflow-x-auto border-b px-2 md:px-6 pt-2.5 sticky top-0 z-10 bg-card">
      <nav
        className="bg-card w-full relative h-full"
        ref={navRef}
        onPointerLeave={() => setHoveredTabIndex(null)}
      >
        <motion.ul
          className="list-none p-0 m-0 font-medium text-sm flex w-full h-full flex-nowrap md:flex-wrap"
          style={{ paddingLeft: paddingLeft }}
        >
          {tabs.map((tab, index) => (
            <div className="relative z-11 pb-1 shrink-0" key={tab.label}>
              <Link
                href={tab.href}
                className="z-11"
                onMouseEnter={() => setHoveredTabIndex(index)}
                onMouseLeave={() => setHoveredTabIndex(null)}
                ref={el => {
                  if (el) {
                    buttonRefs[index] = el as HTMLAnchorElement;
                  }
                }}
              >
                <MotionTab href={tab.href} subRoutes={tab.subRoutes}>
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    {tab.label}
                    {tab.external && <ExternalLink className="size-4" />}
                  </span>
                </MotionTab>
              </Link>
            </div>
          ))}
        </motion.ul>
        <AnimatePresence>
          {hoveredRect && navRect && (
            <motion.div
              key="hover"
              className={`absolute z-10 top-0 left-0 rounded-md bg-accent`}
              initial={{
                ...getHoverAnimationProps(hoveredRect, navRect),
                opacity: 0,
              }}
              animate={{
                ...getHoverAnimationProps(hoveredRect, navRect),
                opacity: 1,
              }}
              exit={{
                ...getHoverAnimationProps(hoveredRect, navRect),
                opacity: 0,
              }}
              transition={{
                type: 'tween',
                ease: 'easeOut',
                duration: 0.15,
              }}
            />
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
};

const getHoverAnimationProps = (hoveredRect: DOMRect, navRect: DOMRect) => ({
  x: hoveredRect.left - navRect.left,
  y: hoveredRect.top - navRect.top,
  width: hoveredRect.width,
  height: hoveredRect.height,
});
