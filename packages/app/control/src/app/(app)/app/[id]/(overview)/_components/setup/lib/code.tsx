import { Code as CodeComponent } from '@/components/ui/code';

import { BundledLanguage } from '@/components/ui/code/shiki.bundle';
import { useHighlighter } from './highlighter-context';

export const Code: React.FC<{
  value: string;
  lang: BundledLanguage;
}> = ({ value, lang }) => {
  const highlighter = useHighlighter();
  return (
    <div className="border rounded-md overflow-hidden bg-muted">
      <CodeComponent value={value} lang={lang} highlighter={highlighter} />
    </div>
  );
};
