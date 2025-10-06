import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { ExampleCards } from '@/components/docs/example-cards';
import { ModelTable } from '@/components/docs/model-table';
import { Mermaid } from '@/components/docs/mermaid';
import * as TabsComponents from 'fumadocs-ui/components/tabs';
import { createGenerator } from 'fumadocs-typescript';
import { AutoTypeTable } from 'fumadocs-typescript/ui';
import * as icons from 'lucide-react';
import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
} from '@icons-pack/react-simple-icons';

const generator = createGenerator();

// Create a clean mapping of icons for MDX components
const iconComponents = {
  ...(icons as unknown as MDXComponents),
  // React Simple Icons - using the same names as in source.ts for consistency
  SiReact,
  SiNextdotjs,
  SiTypescript,
} as const;

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...iconComponents,
    ...defaultMdxComponents,
    ...TabsComponents,
    ExampleCards,
    ModelTable,
    Mermaid,
    AutoTypeTable: (props: React.ComponentProps<typeof AutoTypeTable>) => (
      <AutoTypeTable {...props} generator={generator} />
    ),
    ...components,
  };
}
