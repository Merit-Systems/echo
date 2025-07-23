'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Users, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ProfileAvatar } from './ui/profile-avatar';
import { CommitChart } from './activity-chart/chart';
import { EchoApp } from '@/lib/types/apps';

const transformActivityData = (data: number[]) => {
  return data.map((count, index) => ({
    index,
    count,
    date: new Date(
      Date.now() - (data.length - 1 - index) * 24 * 60 * 60 * 1000
    ).toISOString(),
  }));
};

interface CarouselProps {
  apps: EchoApp[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
  showControls?: boolean;
  showIndicators?: boolean;
}

export const Carousel: React.FC<CarouselProps> = ({
  apps,
  autoPlay = true,
  autoPlayInterval = 5000,
  className,
  showControls = true,
  showIndicators = true,
}) => {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying] = useState(autoPlay);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % apps.length);
  }, [apps.length]);

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + apps.length) % apps.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handleAppClick = (appId: string) => {
    router.push(`/apps/${appId}`);
  };

  useEffect(() => {
    if (isPlaying && autoPlay) {
      intervalRef.current = setInterval(nextSlide, autoPlayInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, autoPlay, autoPlayInterval, nextSlide]);

  // Scroll to current slide
  useEffect(() => {
    if (carouselRef.current) {
      const slideWidth = carouselRef.current.clientWidth;
      carouselRef.current.scrollTo({
        left: currentSlide * slideWidth,
        behavior: 'smooth',
      });
    }
  }, [currentSlide]);

  if (!apps.length) return null;

  return (
    <div className={cn('relative w-full max-w-6xl mx-auto', className)}>
      {/* Carousel Container */}
      <div className="relative h-[32rem]">
        <div className="absolute inset-0 overflow-hidden">
          <div
            ref={carouselRef}
            className="flex transition-transform duration-500 ease-out h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {apps.map(app => {
              const activityData = app.activityData || [];
              const ownerName = app.owner.name || app.owner.email;

              return (
                <div
                  key={app.id}
                  className="w-full flex-shrink-0 px-4 pb-8 h-full"
                >
                  {/* App Card - Styled like MeritRepoCard */}
                  <Card
                    className="p-4 hover:border-secondary relative shadow-lg dark:shadow-secondary dark:shadow-[0_0_8px] w-full cursor-pointer flex flex-col gap-4 transition-all duration-300 h-[calc(100%-2rem)]"
                    onClick={() => handleAppClick(app.id)}
                  >
                    {/* Header Section */}
                    <div className="flex items-center justify-between gap-4 w-full">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <ProfileAvatar
                          name={app.name}
                          src={
                            app.profilePictureUrl || app.owner.profilePictureUrl
                          }
                          size="md"
                          className="mt-5"
                        />
                        <div className="flex flex-col gap-1 items-start flex-1.5 overflow-hidden">
                          <h3 className="text-6xl font-bold hover:text-foreground/80 transition-colors w-full truncate leading-tight">
                            {app.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-4xl font-extralight">by</span>
                            <span className="text-4xl font-medium text-secondary">
                              {ownerName}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Compact Activity Chart */}
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-96 h-56">
                          <CommitChart
                            data={{
                              data: transformActivityData(activityData),
                              isLoading: false,
                            }}
                            numPoints={activityData.length}
                            timeWindowOption={{ value: '7d' }}
                            startDate={
                              new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                            }
                            endDate={new Date()}
                            chartHeight={224}
                            shouldAnimate={false}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Description */}
                    <p className="text-lg text-foreground/80 line-clamp-2 text-ellipsis font-medium leading-relaxed">
                      {app.description || 'No description available'}
                    </p>

                    {/* Spacer to push stats to bottom */}
                    <div className="flex-1"></div>

                    {/* Stats Section - Styled like bottom section of MeritRepoCard */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-lg text-muted-foreground">
                          <Users className="h-5 w-5" />
                          <span>{app._count.apiKeys.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1 text-lg text-muted-foreground">
                          <Zap className="h-5 w-5" />
                          <span>
                            {app._count.transactions.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge className="shrink-0 text-black dark:text-white border-[1px] bg-transparent shadow-none w-fit text-base">
                          ${(app.totalCost / 1000).toFixed(1)}k
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      {showControls && apps.length > 1 && (
        <>
          {/* Previous Button */}
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="absolute -left-8 top-1/2 -translate-y-1/2 z-10 disabled:opacity-30 disabled:cursor-not-allowed group"
            aria-label="Previous slide"
          >
            <div className="w-10 h-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center transition-all duration-200 group-hover:bg-white dark:group-hover:bg-gray-700 group-hover:scale-110">
              <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </div>
          </button>

          {/* Next Button */}
          <button
            onClick={nextSlide}
            disabled={currentSlide === apps.length - 1}
            className="absolute -right-8 top-1/2 -translate-y-1/2 z-10 disabled:opacity-30 disabled:cursor-not-allowed group"
            aria-label="Next slide"
          >
            <div className="w-10 h-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center transition-all duration-200 group-hover:bg-white dark:group-hover:bg-gray-700 group-hover:scale-110">
              <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </div>
          </button>
        </>
      )}

      {/* Page Indicators */}
      {showIndicators && apps.length > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {apps.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                index === currentSlide
                  ? 'bg-blue-500 w-6'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress indicator for auto-play
      {autoPlay && isPlaying && (
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700">
          <div 
            className="h-full bg-blue-500 transition-all ease-linear"
            style={{
              width: '100%',
              animation: `progress ${autoPlayInterval}ms linear infinite`
            }}
          />
        </div>
      )} */}

      <style jsx>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Carousel;
