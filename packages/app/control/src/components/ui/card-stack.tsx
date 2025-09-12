'use client';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

let interval: NodeJS.Timeout;

interface Card {
  key: string;
  content: React.ReactNode;
}

interface CardStackProps {
  items: Card[];
  offset?: number;
  scaleFactor?: number;
  className?: string;
}

export const CardStack: React.FC<CardStackProps> = ({
  items,
  offset,
  scaleFactor,
  className,
}) => {
  const CARD_OFFSET = offset || 10;
  const SCALE_FACTOR = scaleFactor || 0.06;
  const [cards, setCards] = useState<
    {
      key: string;
      content: React.ReactNode;
    }[]
  >(items);

  useEffect(() => {
    startFlipping();

    return () => clearInterval(interval);
  }, []);
  const startFlipping = () => {
    interval = setInterval(() => {
      setCards(prevCards => {
        const newArray = [...prevCards]; // create a copy of the array
        newArray.unshift(newArray.pop()!); // move the last element to the front
        return newArray;
      });
    }, 5000);
  };

  return (
    <div className="relative size-full">
      {cards.map((card, index) => {
        return (
          <motion.div
            key={card.key}
            className={cn(
              'absolute w-full inset-0',
              'rounded-xl border bg-card text-card-foreground shadow-xs border-border',
              className
            )}
            style={{
              transformOrigin: 'top center',
            }}
            animate={{
              top: index * -CARD_OFFSET,
              scale: 1 - index * SCALE_FACTOR, // decrease scale for cards that are behind
              zIndex: cards.length - index, //  decrease z-index for the cards that are behind
            }}
          >
            {card.content}
          </motion.div>
        );
      })}
    </div>
  );
};
