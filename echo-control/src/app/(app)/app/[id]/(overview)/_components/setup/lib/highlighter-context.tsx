import type { Highlighter } from '@/components/ui/code/shiki.bundle';
import { createContext, useContext } from 'react';

const HighlighterContext = createContext<Highlighter | null>(null);

export const HighlighterProvider = ({
  children,
  highlighter,
}: {
  children: React.ReactNode;
  highlighter: Highlighter;
}) => {
  return (
    <HighlighterContext.Provider value={highlighter}>
      {children}
    </HighlighterContext.Provider>
  );
};

export const useHighlighter = () => {
  const highlighter = useContext(HighlighterContext);
  if (!highlighter) {
    throw new Error('Highlighter not found');
  }
  return highlighter;
};
