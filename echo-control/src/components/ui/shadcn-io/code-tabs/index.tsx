'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TabsContents,
  useTabs,
  type TabsProps,
} from '@/components/ui/shadcn-io/tabs';
import { CopyButton } from '@/components/ui/shadcn-io/copy-button';
import { Code } from '../../code';
import type { BundledLanguage } from '../../code/shiki.bundle';

type CodeTabsProps = {
  codes: Record<string, string>;
  lang?: BundledLanguage;
  themes?: {
    light: string;
    dark: string;
  };
  copyButton?: boolean;
  onCopy?: (content: string) => void;
} & Omit<TabsProps, 'children'>;

function CodeTabsContent({
  codes,
  lang = 'shell',
  copyButton = true,
  onCopy,
}: {
  codes: Record<string, string>;
  lang?: BundledLanguage;
  copyButton?: boolean;
  onCopy?: (content: string) => void;
}) {
  const { activeValue } = useTabs();

  return (
    <>
      <TabsList
        data-slot="install-tabs-list"
        className="w-full relative justify-between rounded-none h-10 bg-muted border-b border-border/75 dark:border-border/50 text-current py-0 px-4"
        activeClassName="rounded-none shadow-none bg-transparent after:content-[''] after:absolute after:inset-x-0 after:h-0.5 after:bottom-0 dark:after:bg-white after:bg-black after:rounded-t-full"
      >
        <div className="flex gap-x-3 h-full">
          {Object.keys(codes).map(code => (
            <TabsTrigger
              key={code}
              value={code}
              className="text-muted-foreground data-[state=active]:text-current px-0"
            >
              {code}
            </TabsTrigger>
          ))}
        </div>

        {copyButton && (
          <CopyButton
            content={codes[activeValue]}
            size="sm"
            variant="ghost"
            className="-me-2 bg-transparent hover:bg-black/5 dark:hover:bg-white/10"
            onCopy={onCopy}
          />
        )}
      </TabsList>
      <TabsContents data-slot="install-tabs-contents">
        {Object.entries(codes).map(([code, rawCode]) => (
          <TabsContent
            data-slot="install-tabs-content"
            key={code}
            className="w-full text-sm flex items-center overflow-auto"
            value={code}
          >
            <Code value={rawCode} lang={lang} />
          </TabsContent>
        ))}
      </TabsContents>
    </>
  );
}

export const CodeTabs = ({
  codes,
  lang = 'shell',
  className,
  defaultValue,
  value,
  onValueChange,
  copyButton = true,
  onCopy,
  ...props
}: CodeTabsProps) => {
  const firstKey = React.useMemo(() => Object.keys(codes)[0] ?? '', [codes]);

  // Handle controlled vs uncontrolled properly
  const tabsProps =
    value !== undefined
      ? { value, onValueChange }
      : { defaultValue: defaultValue ?? firstKey };

  return (
    <Tabs
      data-slot="install-tabs"
      className={cn(
        'w-full gap-0 bg-muted/50 rounded-lg border overflow-hidden',
        className
      )}
      {...tabsProps}
      {...props}
    >
      <CodeTabsContent
        codes={codes}
        lang={lang}
        copyButton={copyButton}
        onCopy={onCopy}
      />
    </Tabs>
  );
};
