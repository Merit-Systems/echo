import Image from 'next/image';

import { Users } from 'lucide-react';

import { CardStack } from '@/components/ui/card-stack';

import { formatCurrency } from '@/lib/balance';

export const UniversalBalance = () => {
  return (
    <div className="size-full flex items-end justify-center">
      <div className="h-36 w-full">
        <CardStack
          items={cards.map(card => ({
            key: card.title,
            content: <Card {...card} />,
          }))}
        />
      </div>
    </div>
  );
};

const cards: CardProps[] = [
  {
    image: '/images/toolkit.svg',
    title: 'Toolkit.dev',
    description: 'Configurable tool-calling chatbot with generative UI',
    author: 'Jason Hedman',
    earnings: 156.78,
    users: 561,
  },
  {
    image: '/images/shirtslop.png',
    title: 'Shirtslop',
    description: 'Generate and print custom shirts from AI images',
    author: 'Ryan Sproule',
    earnings: 212.91,
    users: 123,
  },
  {
    image: '/images/vibes.png',
    title: 'EchoVibes',
    description: "An improved fork of Vercel's OSS vibe coding app.",
    author: 'Sam Ragsdale',
    earnings: 348.63,
    users: 488,
  },
];

interface CardProps {
  image: string;
  title: string;
  author: string;
  description: string;
  earnings: number;
  users: number;
}

const Card: React.FC<CardProps> = ({
  image,
  title,
  description,
  author,
  earnings,
  users,
}) => {
  return (
    <div className="flex flex-col gap-2 p-2 size-full">
      <div className="flex items-center gap-2">
        <Image
          src={image}
          alt={title}
          width={20}
          height={20}
          className="size-6"
        />
        <div>
          <h3 className="font-bold">{title}</h3>
          <p className="text-xs text-muted-foreground font-semibold">
            {author}
          </p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
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
