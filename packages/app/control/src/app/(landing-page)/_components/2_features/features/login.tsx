import { Logo } from '@/components/ui/logo';

const GrayAuroraText = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
    const colors = [
        'hsl(0 0% 35%)',
        'hsl(0 0% 45%)',
        'hsl(0 0% 50%)',
        'hsl(0 0% 45%)',
        'hsl(0 0% 35%)',
    ];

    const gradientStyle = {
        backgroundImage: `linear-gradient(135deg, ${colors.join(', ')}, ${colors[0]})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        animationDuration: '10s',
    };

    return (
        <span className={`relative inline-block ${className}`}>
            <span className="sr-only">{children}</span>
            <span
                className="relative animate-aurora bg-[length:200%_auto] bg-clip-text text-transparent"
                style={gradientStyle}
                aria-hidden="true"
            >
                {children}
            </span>
        </span>
    );
};

export const Login = () => {
    return (
        <div className="size-full flex items-center justify-center">
            <div className="flex items-center justify-center">
                {/* <CardStack
                    items={cards.map(card => ({
                        key: card.title,
                        content: <Card {...card} />,
                    }))}
                /> */}

                <button
                    className="inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-md text-base md:text-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed gap-4 active:shadow-none active:translate-y-[2px] border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-14 py-1 w-[160px] px-1"
                >
                    <Logo className="size-8" />
                    <GrayAuroraText className="text-xl font-semibold tracking-wide">
                        Connect
                    </GrayAuroraText>
                </button>


            </div>
        </div>
    );
};

