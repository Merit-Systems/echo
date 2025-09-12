import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Route } from 'next';

interface ExampleCard<T extends string> {
  title: string;
  icon: React.ReactNode;
  docsLink: Route<T>;
  liveExampleLink?: string;
  githubLink?: string;
}

interface ExampleCardsProps<T extends string> {
  cards: ExampleCard<T>[];
}

export function ExampleCards<T extends string>({
  cards,
}: ExampleCardsProps<T>) {
  return (
    <div className="flex justify-center my-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
        {cards.map((card, index) => (
          <div key={index} className="group flex flex-col gap-2">
            {/* Main card - clickable to docs */}
            <Link
              href={card.docsLink}
              className="relative flex h-28 w-28 flex-col flex-wrap items-center justify-between rounded-lg border border-border bg-card p-4 !no-underline shadow-sm transition-colors duration-300 hover:bg-accent/50"
            >
              <div className="w-10 h-10 flex items-center justify-center">
                {card.icon}
              </div>
              <div className="mt-3 text-sm">{card.title}</div>
            </Link>

            {/* Action buttons - full width, side by side */}
            <div className="flex justify-stretch gap-2">
              {/* Live Example Link */}
              {card.liveExampleLink && (
                <a
                  href={card.liveExampleLink}
                  className="flex w-full justify-center rounded-md border border-border/50 bg-muted p-2 text-sm hover:bg-accent transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Live Example"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              )}

              {/* GitHub Link */}
              {card.githubLink && (
                <a
                  href={card.githubLink}
                  className="flex w-full justify-center rounded-md border border-border/50 bg-muted p-2 text-sm hover:bg-accent transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="GitHub Repository"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 256 256"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      d="M119.83,56A52,52,0,0,0,76,32a51.92,51.92,0,0,0-3.49,44.7A49.28,49.28,0,0,0,64,104v8a48,48,0,0,0,48,48h48a48,48,0,0,0,48-48v-8a49.28,49.28,0,0,0-8.51-27.3A51.92,51.92,0,0,0,196,32a52,52,0,0,0-43.83,24Z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="16"
                    />
                    <path
                      d="M104,232V192a32,32,0,0,1,32-32h0a32,32,0,0,1,32,32v40"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="16"
                    />
                    <path
                      d="M104,208H72a32,32,0,0,1-32-32A32,32,0,0,0,8,144"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="16"
                    />
                  </svg>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
