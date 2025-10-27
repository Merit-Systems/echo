'use client';

import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { DemoCard, cards } from './demo-card';

const AppDemoStack = () => {
  const CARD_OFFSET = 10;
  const SCALE_FACTOR = 0.06;
  const [cardOrder, setCardOrder] = React.useState(cards);

  useEffect(() => {
    const interval = setInterval(() => {
      setCardOrder(prevCards => {
        const newArray = [...prevCards];
        newArray.unshift(newArray.pop()!); // move the last element to the front
        return newArray;
      });
    }, 7500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="size-full flex items-end justify-center">
      <div className="h-56 md:h-48 w-full relative">
        {cardOrder.map((card, index) => {
          const isFirst = index === 0;
          return (
            <motion.div
              key={card.title}
              className="absolute w-full inset-0 rounded-xl border bg-card text-card-foreground shadow-xs border-border"
              style={{
                transformOrigin: 'top center',
              }}
              animate={{
                top: index * -CARD_OFFSET,
                scale: 1 - index * SCALE_FACTOR,
                zIndex: cardOrder.length - index,
              }}
            >
              <DemoCard {...card} isFirst={isFirst} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export const AppDemos = () => {
  return (
    <div className="flex w-full px-2 md:px-0">
      <div className="hidden md:block md:w-1/6" />
      <div className="w-full md:w-2/3 flex items-center justify-center">
        <AppDemoStack />
      </div>
      <div className="hidden md:block md:w-1/6" />
    </div>
  );
};
