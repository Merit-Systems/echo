import { DocsLayout } from 'fumadocs-ui/layouts/docs';

import { DocsLogo } from '@/components/docs/docs-logo';

import { source } from '../../../docs/source';

import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { SiGithub, SiDiscord } from '@icons-pack/react-simple-icons';
const baseOptions: BaseLayoutProps = {
  nav: {
    title: <DocsLogo />,
  },
  links: [
    {
      text: 'GitHub',
      icon: <SiGithub className="size-4" />,
      url: 'https://github.com/Merit-Systems/echo',
      external: true,
    },
    {
      text: 'Discord',
      icon: <SiDiscord className="size-4" />,
      url: 'https://discord.gg/JuKt7tPnNc',
      external: true,
    },
    {
      text: 'Terminal',
      url: 'https://terminal.merit.systems',
      external: true,
    },
    {
      text: 'llms-full.txt',
      url: '/llms-full.txt',
      external: true,
    },
  ],
};

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout
      tree={source.pageTree}
      {...baseOptions}
      sidebar={{
        collapsible: true,
      }}
    >
      {children}
    </DocsLayout>
  );
}
