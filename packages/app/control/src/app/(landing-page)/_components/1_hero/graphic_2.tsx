'use client';

import Image from 'next/image';
import React, { useEffect } from 'react';

import { Users, Calendar, Mail, Loader2, Check } from 'lucide-react';
import { motion } from 'motion/react';


import { formatCurrency } from '@/lib/utils';
import { Logo } from '@/components/ui/logo';

export const CardStack = () => {
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
            <div className="h-48 w-full relative">
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
                            <Card {...card} isFirst={isFirst} />
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

interface CardBodyProps {
    isActive: boolean;
}

interface ToolCallState {
    text: string;
    displayText: string;
    isTyping: boolean;
    isLoading: boolean;
    isComplete: boolean;
}

const ToolkitBody: React.FC<CardBodyProps> = ({ isActive }) => {
    const userPrompt = 'Cancel my meetings';
    const [userText, setUserText] = React.useState('');
    const [showTools, setShowTools] = React.useState(false);

    const [tool1, setTool1] = React.useState<ToolCallState>({
        text: 'Query Google Calendar',
        displayText: '',
        isTyping: false,
        isLoading: false,
        isComplete: false,
    });

    const [tool2, setTool2] = React.useState<ToolCallState>({
        text: 'Sending email to bill@merit.systems',
        displayText: '',
        isTyping: false,
        isLoading: false,
        isComplete: false,
    });

    useEffect(() => {
        if (!isActive) {
            setUserText('');
            setShowTools(false);
            setTool1({ text: 'Query Google Calendar', displayText: '', isTyping: false, isLoading: false, isComplete: false });
            setTool2({ text: 'Sending email to bill@merit.systems', displayText: '', isTyping: false, isLoading: false, isComplete: false });
            return;
        }

        // Type user prompt
        let currentIndex = 0;
        const userInterval = setInterval(() => {
            if (currentIndex <= userPrompt.length) {
                setUserText(userPrompt.slice(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(userInterval);
                setShowTools(true);

                // Start tool 1 after delay
                setTimeout(() => {
                    animateTool(1);
                }, 300);
            }
        }, 30);

        return () => clearInterval(userInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive]);

    const animateTool = (toolNum: number) => {
        const tools = [tool1, tool2];
        const setTools = [setTool1, setTool2];
        const tool = tools[toolNum - 1];
        const setTool = setTools[toolNum - 1];

        // Start typing
        setTool({ ...tool, isTyping: true });

        let idx = 0;
        const typeInterval = setInterval(() => {
            if (idx <= tool.text.length) {
                setTool(prev => ({ ...prev, displayText: tool.text.slice(0, idx) }));
                idx++;
            } else {
                clearInterval(typeInterval);
                // Start loading
                setTool(prev => ({ ...prev, isTyping: false, isLoading: true }));

                setTimeout(() => {
                    // Complete
                    setTool(prev => ({ ...prev, isLoading: false, isComplete: true }));

                    // Start next tool
                    if (toolNum < 2) {
                        setTimeout(() => animateTool(toolNum + 1), 200);
                    }
                }, 400);
            }
        }, 10);
    };

    return (
        <div className="flex flex-col gap-2 h-full">
            {/* User message */}
            <div className="ml-auto max-w-[80%]">
                <div className="text-xs bg-primary text-primary-foreground rounded-lg px-2 py-1.5">
                    {userText}
                    {userText.length < userPrompt.length && (
                        <span className="animate-pulse">|</span>
                    )}
                </div>
            </div>

            {/* Tool calls */}
            {showTools && (
                <div className="flex flex-col gap-1.5">
                    {(tool1.isTyping || tool1.isLoading || tool1.isComplete) && (
                        <div className="flex items-center gap-2 text-xs bg-muted rounded px-2 py-1 border border-border">
                            <Calendar className="size-3 flex-shrink-0" />
                            <span className="flex-1">{tool1.displayText}</span>
                            {tool1.isLoading && <Loader2 className="size-3 animate-spin" />}
                            {tool1.isComplete && <Check className="size-3 text-green-600" />}
                        </div>
                    )}

                    {(tool2.isTyping || tool2.isLoading || tool2.isComplete) && (
                        <div className="flex items-center gap-2 text-xs bg-muted rounded px-2 py-1 border border-border">
                            <Mail className="size-3 flex-shrink-0" />
                            <span className="flex-1">{tool2.displayText}</span>
                            {tool2.isLoading && <Loader2 className="size-3 animate-spin" />}
                            {tool2.isComplete && <Check className="size-3 text-green-600" />}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const ShirtslopImageReveal: React.FC<{ src: string; delay: number; isActive: boolean }> = ({ src, delay, isActive }) => {
    const [revealProgress, setRevealProgress] = React.useState(0);

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
                <Image
                    src={src}
                    alt="Shirt design"
                    fill
                    className="object-contain"
                />
            </div>
        </div>
    );
};

const ShirtslopBody: React.FC<CardBodyProps> = ({ isActive }) => {
    const [selectedImage, setSelectedImage] = React.useState(false);
    const [showOnShirt, setShowOnShirt] = React.useState(false);

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
                <ShirtslopImageReveal src="/landing/uni_1.png" delay={0} isActive={isActive} />
                <motion.div
                    animate={{
                        scale: selectedImage ? [1, 0.95, 1] : 1,
                    }}
                    transition={{
                        duration: 0.3,
                    }}
                >
                    <div className={`relative ${selectedImage ? 'ring-2 ring-primary rounded-md' : ''}`}>
                        <ShirtslopImageReveal src="/landing/uni_2.png" delay={500} isActive={isActive} />
                    </div>
                </motion.div>
                <ShirtslopImageReveal src="/landing/uni_3.png" delay={1000} isActive={isActive} />
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

const EchoVibesBody: React.FC<CardBodyProps> = ({ isActive }) => {
    const promptText = 'Indie project landing page';
    const [displayText, setDisplayText] = React.useState('');
    const [showExecuting, setShowExecuting] = React.useState(false);
    const [showBrowser, setShowBrowser] = React.useState(false);
    const [showHeaderSkeleton, setShowHeaderSkeleton] = React.useState(false);
    const [showHeaderText, setShowHeaderText] = React.useState(false);
    const [showContentSkeletons, setShowContentSkeletons] = React.useState(false);

    useEffect(() => {
        if (!isActive) {
            setDisplayText('');
            setShowExecuting(false);
            setShowBrowser(false);
            setShowHeaderSkeleton(false);
            setShowHeaderText(false);
            setShowContentSkeletons(false);
            return;
        }

        // Typewriter animation for prompt
        let currentIndex = 0;
        const typeInterval = setInterval(() => {
            if (currentIndex <= promptText.length) {
                setDisplayText(promptText.slice(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(typeInterval);
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
        }, 30);

        return () => clearInterval(typeInterval);
    }, [isActive]);

    return (
        <div className="flex gap-3 h-full">
            {/* Left column - Chat */}
            <div className="flex-1 flex flex-col gap-2 items-start pt-2">
                {/* User message */}
                <div className="ml-auto max-w-[80%]">
                    <div className="text-xs bg-primary text-primary-foreground rounded-lg px-2 py-1.5">
                        {displayText}
                        {displayText.length < promptText.length && (
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

const cards: CardProps[] = [
    {
        image: '/images/toolkit.svg',
        title: 'Toolkit.dev',
        body: ToolkitBody,
        author: 'Jason Hedman',
        earnings: 156.78,
        users: 561,
    },
    {
        image: '/images/shirtslop.png',
        title: 'Shirtslop',
        body: ShirtslopBody,
        author: 'Ryan Sproule',
        earnings: 212.91,
        users: 123,
    },
    {
        image: '/images/vibes.png',
        title: 'EchoVibes',
        body: EchoVibesBody,
        author: 'Sam Ragsdale',
        earnings: 348.63,
        users: 488,
    },
];

interface CardProps {
    image: string;
    title: string;
    author: string;
    body: React.FC<CardBodyProps>;
    earnings: number;
    users: number;
    isFirst?: boolean;
}

const AnimatedNumber: React.FC<{ value: number; shouldAnimate: boolean }> = ({ value, shouldAnimate }) => {
    const [displayValue, setDisplayValue] = React.useState(0);

    useEffect(() => {
        if (!shouldAnimate) {
            setDisplayValue(0);
            return;
        }

        // Start animation after flip completes (500ms delay + 600ms flip = 1100ms)
        const timeout = setTimeout(() => {
            const duration = 1000; // 1 second to count up
            const startTime = Date.now();
            const startValue = 0;
            let rafId: number;

            const animate = () => {
                const now = Date.now();
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = startValue + (value - startValue) * eased;

                setDisplayValue(current);

                if (progress < 1) {
                    rafId = requestAnimationFrame(animate);
                }
            };

            rafId = requestAnimationFrame(animate);

            return () => {
                cancelAnimationFrame(rafId);
            };
        }, 100);

        return () => clearTimeout(timeout);
    }, [value, shouldAnimate]);

    return (
        <span className="tabular-nums">
            {formatCurrency(displayValue)}
        </span>
    );
};

const Card: React.FC<CardProps> = ({
    image,
    title,
    body: BodyComponent,
    earnings,
    users,
    isFirst = false,
}) => {
    const [clicked, setClicked] = React.useState(false);
    const [flipped, setFlipped] = React.useState(false);
    const [bodyActive, setBodyActive] = React.useState(false);

    useEffect(() => {
        // Reset and start animation only when card becomes first
        if (isFirst) {
            setClicked(false);
            setFlipped(false);
            setBodyActive(false);

            // Simulate click at 500ms
            const clickTimeout = setTimeout(() => {
                setClicked(true);
                // Hold click for 100ms, then flip
                setTimeout(() => {
                    setFlipped(true);
                }, 100);
            }, 500);

            // Start body animations after flip completes (500ms delay + 100ms click + 600ms flip = 1200ms)
            const bodyTimeout = setTimeout(() => {
                setBodyActive(true);
            }, 1200);

            return () => {
                clearTimeout(clickTimeout);
                clearTimeout(bodyTimeout);
            };
        } else {
            // Reset when card goes back in stack
            setClicked(false);
            setFlipped(false);
            setBodyActive(false);
        }
    }, [isFirst]);

    return (
        <div className="flex flex-col gap-2 p-2 size-full">

            <div className="flex items-center gap-2 border-b pb-2 justify-between">
                <div className="flex gap-2">
                    <Image
                        src={image}
                        alt={title}
                        width={20}
                        height={20}
                        className="size-6"
                    />
                    <div>
                        <h3 className="font-bold">{title}</h3>
                    </div>
                </div>
                <div style={{ perspective: '1000px' }}>
                    <motion.div
                        className="relative w-[96px] h-8 md:h-9"
                        style={{ transformStyle: 'preserve-3d' }}
                        animate={{
                            rotateY: flipped ? 180 : 0,
                        }}
                        transition={{
                            duration: 0.6,
                            ease: 'easeInOut',
                        }}
                    >
                        {/* Front side */}
                        <motion.div
                            className="absolute inset-0"
                            style={{
                                backfaceVisibility: 'hidden',
                            }}
                            animate={{
                                y: clicked && !flipped ? 2 : 0,
                                scale: clicked && !flipped ? 0.97 : 1,
                            }}
                            transition={{
                                duration: 0.1,
                            }}
                        >
                            <button className={`w-full h-full inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-md text-xs md:text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed gap-2 border bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 px-2 ${clicked && !flipped ? 'shadow-none bg-accent' : 'shadow-xs'}`}>
                                <Logo className="size-4" />
                                <span className="text-xs">Connect</span>
                            </button>
                        </motion.div>

                        {/* Back side */}
                        <div
                            className="absolute inset-0"
                            style={{
                                backfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg)',
                            }}
                        >
                            <button className="w-full h-full inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-md text-xs md:text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed gap-2 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 px-2">
                                <Logo className="size-4" />
                                <span className="text-xs font-bold text-primary">
                                    <AnimatedNumber value={84.29} shouldAnimate={flipped} />
                                </span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>

            <BodyComponent isActive={bodyActive} />
            <div className="flex items-center justify-between gap-2 mt-auto">
                <p className="text-xs text-primary font-bold">
                    {formatCurrency(earnings)}
                </p>
                <div className="flex items-center gap-1 text-muted-foreground">
                    <p className="text-xs">{users.toLocaleString()}</p>
                    <Users className="size-3" />
                </div>
            </div>
        </div>
    );
};



export const HeroGraphic2 = () => {
  return (
      <div className="flex w-full">
        <div className="w-1/6" />
        <div className="w-2/3 flex items-center justify-center">
          <CardStack />
        </div>
        <div className="w-1/6" />
      </div>
  );
};