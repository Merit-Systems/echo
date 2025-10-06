'use client';

import { useTheme } from 'next-themes';
import mermaid from 'mermaid';
import { useEffect, useId, useRef } from 'react';

export function Mermaid({
  chart,
  children,
}: {
  chart?: string;
  children?: string;
}): React.ReactElement {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  // Support both `chart` prop and children
  const code = chart ?? children ?? '';

  useEffect(() => {
    if (!ref.current) return;

    const renderDiagram = async () => {
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: resolvedTheme === 'dark' ? 'dark' : 'default',
          securityLevel: 'loose',
          fontFamily: 'inherit',
        });

        const { svg } = await mermaid.render(`mermaid-${id}`, code);
        if (ref.current) {
          ref.current.innerHTML = svg;
        }
      } catch (error) {
        console.error('Mermaid rendering error:', error);
        if (ref.current) {
          ref.current.innerHTML = `<pre class="text-red-500">Error rendering diagram</pre>`;
        }
      }
    };

    void renderDiagram();
  }, [code, id, resolvedTheme]);

  return <div ref={ref} className="my-4" />;
}
