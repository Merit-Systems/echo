import { DocsLayout } from 'fumadocs-ui/layouts/docs';

import { DocsLogo } from '@/components/docs/docs-logo';

import { source } from '../../../docs/source';

import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

const baseOptions: BaseLayoutProps = {
  nav: {
    title: <DocsLogo />,
  },
  links: [
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
