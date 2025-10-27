'use client';

import React, { useEffect, useState } from 'react';
import { useTypewriter } from '@/hooks/use-typewriter';
import type { CardBodyProps } from './demo-card';

export const EchoVibesBody: React.FC<CardBodyProps> = ({ isActive }) => {
  const promptText = 'Indie project landing page';
  const { displayText, isComplete: userTextComplete } = useTypewriter(
    promptText,
    isActive,
    30
  );
  const [showExecuting, setShowExecuting] = useState(false);
  const [showBrowser, setShowBrowser] = useState(false);
  const [showHeaderSkeleton, setShowHeaderSkeleton] = useState(false);
  const [showHeaderText, setShowHeaderText] = useState(false);
  const [showContentSkeletons, setShowContentSkeletons] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setShowExecuting(false);
      setShowBrowser(false);
      setShowHeaderSkeleton(false);
      setShowHeaderText(false);
      setShowContentSkeletons(false);
      return;
    }

    if (userTextComplete) {
      // Show "Executing..." response
      setTimeout(() => {
        setShowExecuting(true);
        // Start browser animations after "Executing..." appears
        setTimeout(() => {
          setShowBrowser(true);
          setTimeout(() => {
            setShowHeaderSkeleton(true);
            setTimeout(() => {
              setShowHeaderSkeleton(false);
              setShowHeaderText(true);
              setTimeout(() => {
                setShowContentSkeletons(true);
              }, 200);
            }, 400);
          }, 200);
        }, 300);
      }, 200);
    }
  }, [userTextComplete, isActive]);

  return (
    <div className="flex gap-3 h-full">
      {/* Left column - Chat */}
      <div className="flex-1 flex flex-col gap-2 items-start pt-2">
        {/* User message */}
        <div className="ml-auto max-w-[80%]">
          <div className="text-xs bg-primary text-primary-foreground rounded-lg px-2 py-1.5">
            {displayText}
            {!userTextComplete && displayText && (
              <span className="animate-pulse">|</span>
            )}
          </div>
        </div>

        {/* Assistant message */}
        {showExecuting && (
          <div className="mr-auto max-w-[80%]">
            <div className="text-xs bg-muted text-muted-foreground rounded-lg px-2 py-1.5 relative overflow-hidden">
              Executing...
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
          </div>
        )}
      </div>

      {/* Right column - Browser window */}
      <div className="flex-1 flex items-start pt-2">
        <div className="w-full h-full border rounded-md bg-background/50 p-2 space-y-2">
          {/* Browser chrome */}
          <div className="flex gap-1 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
          </div>

          {showBrowser && (
            <>
              {/* Header */}
              <div className="border-b pb-2">
                {showHeaderSkeleton && (
                  <div className="h-4 bg-muted-foreground/20 rounded animate-pulse" />
                )}
                {showHeaderText && (
                  <div className="text-xs font-semibold">Indie Saas</div>
                )}
              </div>

              {/* Content skeletons */}
              {showContentSkeletons && (
                <div className="space-y-2">
                  <div className="h-2 bg-muted-foreground/20 rounded animate-pulse" />
                  <div className="h-2 bg-muted-foreground/20 rounded animate-pulse" />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
