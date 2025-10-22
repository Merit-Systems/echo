'use client';

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import type { CardBodyProps } from './demo-card';

const ShirtslopImageReveal: React.FC<{
  src: string;
  delay: number;
  isActive: boolean;
}> = ({ src, delay, isActive }) => {
  const [revealProgress, setRevealProgress] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setRevealProgress(0);
      return;
    }

    const timeout = setTimeout(() => {
      const duration = 1000;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        setRevealProgress(progress * 100);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timeout);
  }, [isActive, delay]);

  return (
    <div className="relative w-16 h-16 overflow-hidden rounded-md border border-border">
      {/* Blurred background */}
      <Image
        src={src}
        alt="Shirt design"
        fill
        className="object-contain"
        style={{ filter: 'blur(20px)' }}
      />
      {/* Revealing sharp image */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          clipPath: `inset(0 0 ${100 - revealProgress}% 0)`,
        }}
      >
        <Image src={src} alt="Shirt design" fill className="object-contain" />
      </div>
    </div>
  );
};

export const ShirtslopBody: React.FC<CardBodyProps> = ({ isActive }) => {
  const [selectedImage, setSelectedImage] = useState(false);
  const [showOnShirt, setShowOnShirt] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setSelectedImage(false);
      setShowOnShirt(false);
      return;
    }

    // After all three images complete (0ms + 1s reveal + 1000ms delay + 1s reveal = ~3s)
    const selectTimeout = setTimeout(() => {
      setSelectedImage(true);
      // Show on shirt after selection animation
      setTimeout(() => {
        setShowOnShirt(true);
      }, 300);
    }, 2450);

    return () => clearTimeout(selectTimeout);
  }, [isActive]);

  return (
    <div className="flex gap-3 h-full">
      {/* Left column - animated images */}
      <div className="flex-1 flex gap-2 justify-center items-center">
        <ShirtslopImageReveal
          src="/landing/uni_1.png"
          delay={0}
          isActive={isActive}
        />
        <motion.div
          animate={{
            scale: selectedImage ? [1, 0.95, 1] : 1,
          }}
          transition={{
            duration: 0.3,
          }}
        >
          <div
            className={`relative ${selectedImage ? 'ring-2 ring-primary rounded-md' : ''}`}
          >
            <ShirtslopImageReveal
              src="/landing/uni_2.png"
              delay={500}
              isActive={isActive}
            />
          </div>
        </motion.div>
        <ShirtslopImageReveal
          src="/landing/uni_3.png"
          delay={1000}
          isActive={isActive}
        />
      </div>

      {/* Right column - blank shirt (full size) */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-full h-full overflow-hidden rounded-md">
          <Image
            src="/landing/shirt_blank.png"
            alt="Blank shirt"
            fill
            className="object-contain"
          />
          {showOnShirt && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <div className="relative w-1/2 h-1/2">
                <Image
                  src="/landing/uni_2_transparent.png"
                  alt="Design on shirt"
                  fill
                  className="object-contain"
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
