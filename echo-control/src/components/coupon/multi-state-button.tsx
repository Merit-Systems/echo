'use client';

import React, { useEffect, useRef, useState } from 'react';
import type {
  Transition} from 'motion/react';
import {
  animate,
  AnimatePresence,
  motion,
  useTime,
  useTransform,
} from 'motion/react';

interface Props {
  onClaim: () => void;
  state: 'idle' | 'processing' | 'success';
  disabled?: boolean;
  className?: string;
  states?: STATES;
}

export const MultiStateCouponButton: React.FC<Props> = ({
  onClaim,
  state,
  disabled = false,
  className = '',
  states,
}) => {
  return (
    <motion.button
      className={`bg-white text-black w-full hover:scale-101 hover:bg-white font-bold h-fit md:h-fit py-3 rounded-xl cursor-pointer shadow-[0_4px_24px_0_rgba(30,64,175,0.18),0_1.5px_6px_0_rgba(0,0,0,0.10)] ${className}`}
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      whileTap={{ scale: disabled ? 1 : 0.99 }}
      onClick={onClaim}
      disabled={disabled || state === 'processing' || state === 'success'}
      transition={SPRING_CONFIG}
    >
      <ButtonContent state={state} states={states} />
    </motion.button>
  );
};

const ButtonContent = ({
  state,
  states,
}: {
  states?: STATES;
  state: 'idle' | 'processing' | 'success';
}) => {
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!buttonRef.current) return;

    if (state === 'success') {
      animate(
        buttonRef.current,
        {
          scale: [1, 1.05, 1],
        },
        {
          duration: 0.4,
          ease: 'easeInOut',
          times: [0, 0.5, 1],
          repeat: 0,
        }
      );
    }
  }, [state]);

  return (
    <motion.div
      ref={buttonRef}
      className="flex items-center justify-center gap-2"
      style={{
        gap: state === 'idle' ? 0 : 8,
      }}
    >
      <Icon state={state} />
      <Label state={state} states={states} />
    </motion.div>
  );
};

/**
 * ==============   Icons   ================
 */
const Icon = ({ state }: { state: 'idle' | 'processing' | 'success' }) => {
  let IconComponent = <></>;

  switch (state) {
    case 'idle':
      IconComponent = <></>;
      break;
    case 'processing':
      IconComponent = <Loader />;
      break;
    case 'success':
      IconComponent = <Check />;
      break;
  }

  return (
    <motion.span
      className="relative flex items-center justify-center h-5"
      animate={{
        width: state === 'idle' ? 0 : 20,
      }}
      transition={SPRING_CONFIG}
    >
      <AnimatePresence>
        <motion.span
          key={state}
          className="absolute left-0 top-0"
          initial={{
            y: -40,
            scale: 0.5,
            filter: 'blur(6px)',
          }}
          animate={{
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
          }}
          exit={{
            y: 40,
            scale: 0.5,
            filter: 'blur(6px)',
          }}
          transition={{
            duration: 0.15,
            ease: 'easeInOut',
          }}
        >
          {IconComponent}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
};

const ICON_SIZE = 20;
const STROKE_WIDTH = 1.5;
const VIEW_BOX_SIZE = 24;

const svgProps = {
  width: ICON_SIZE,
  height: ICON_SIZE,
  viewBox: `0 0 ${VIEW_BOX_SIZE} ${VIEW_BOX_SIZE}`,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: STROKE_WIDTH,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const springConfig: Transition = {
  type: 'spring',
  stiffness: 150,
  damping: 20,
};

const animations = {
  initial: { pathLength: 0 },
  animate: { pathLength: 1 },
  transition: springConfig,
};

function Check() {
  return (
    <motion.svg {...svgProps}>
      <motion.polyline points="4 12 9 17 20 6" {...animations} />
    </motion.svg>
  );
}

function Loader() {
  const time = useTime();
  const rotate = useTransform(time, [0, 1000], [0, 360], { clamp: false });

  return (
    <motion.div
      style={{
        rotate,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: ICON_SIZE,
        height: ICON_SIZE,
      }}
    >
      <motion.svg {...svgProps}>
        <motion.path d="M21 12a9 9 0 1 1-6.219-8.56" {...animations} />
      </motion.svg>
    </motion.div>
  );
}

const Label = ({
  state,
  states = STATES,
}: {
  state: 'idle' | 'processing' | 'success';
  states?: STATES;
}) => {
  const [labelWidth, setLabelWidth] = useState(0);
  const measureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (measureRef.current) {
      const { width } = measureRef.current.getBoundingClientRect();
      setLabelWidth(width);
    }
  }, [state]);

  return (
    <>
      {/* Hidden copy of label to measure width */}
      <div ref={measureRef} className="absolute invisible whitespace-nowrap">
        {states[state]}
      </div>

      <motion.span
        className="relative"
        animate={{
          width: labelWidth,
        }}
        transition={SPRING_CONFIG}
      >
        <AnimatePresence mode="sync" initial={false}>
          <motion.div
            key={state}
            className="whitespace-nowrap"
            initial={{
              y: -20,
              opacity: 0,
              filter: 'blur(10px)',
              position: 'absolute',
            }}
            animate={{
              y: 0,
              opacity: 1,
              filter: 'blur(0px)',
              position: 'relative',
            }}
            exit={{
              y: 20,
              opacity: 0,
              filter: 'blur(10px)',
              position: 'absolute',
            }}
            transition={{
              duration: 0.2,
              ease: 'easeInOut',
            }}
          >
            {states[state]}
          </motion.div>
        </AnimatePresence>
      </motion.span>
    </>
  );
};

export interface STATES {
  idle: string;
  processing: string;
  success: string;
}

/**
 * ==============   Utils   ================
 */
const STATES: STATES = {
  idle: 'Claim and Continue',
  processing: 'Claiming...',
  success: 'Claimed',
} as const;

const SPRING_CONFIG: Transition = {
  type: 'spring',
  stiffness: 600,
  damping: 30,
};
