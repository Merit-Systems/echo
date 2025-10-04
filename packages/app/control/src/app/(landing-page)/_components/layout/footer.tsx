import React from 'react';

import Link from 'next/link';
import { Logo } from '@/components/ui/logo';
import type { Route } from 'next';
import { SiDiscord, SiGithub } from '@icons-pack/react-simple-icons';

type Link = {
  title: string;
  icon?: React.ReactNode;
} & (
  | {
      external: true;
      href: string;
    }
  | {
      external?: undefined;
      href: Route;
    }
);

const links: Link[] = [
  {
    title: 'Github',
    href: 'https://github.com/Merit-Systems/echo',
    icon: <SiGithub className="size-4" />,
    external: true,
  },
  {
    title: 'Discord',
    href: 'https://discord.gg/merit',
    icon: <SiDiscord className="size-4" />,
    external: true,
  },
  {
    title: 'About Merit',
    href: 'https://merit.systems',
    external: true,
  },
  {
    title: 'Terms of Service',
    href: '/terms',
  },
  {
    title: 'Privacy Policy',
    href: '/privacy',
  },
];

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t bg-card border-dashed p-2 md:p-4 text-sm flex flex-col md:flex-row items-center gap-4">
      <div className="flex min-w-[200px] flex-1 flex-col">
        <Link href="/" className="cursor-pointer">
          <div className="flex h-full cursor-pointer items-center gap-2">
            <Logo className="size-8" />
            <h1 className="text-base font-bold">
              Echo <span className="font-light">by</span>{' '}
              <span className="font-medium">Merit</span>
              <span className="font-light">Systems</span>
            </h1>
          </div>
        </Link>
      </div>
      <div className="flex gap-4 flex-wrap justify-center">
        {links.map(link =>
          link.external ? (
            <a
              key={link.title}
              href={link.href}
              target="_blank"
              className={linkClassName}
            >
              {link.icon}
              {link.title}
            </a>
          ) : (
            <Link key={link.title} href={link.href} className={linkClassName}>
              {link.icon}
              {link.title}
            </Link>
          )
        )}
      </div>
    </footer>
  );
};

const linkClassName =
  'text-muted-foreground hover:text-foreground hover:underline cursor-pointer font-medium flex items-center gap-2';
