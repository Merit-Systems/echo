'use client';

import React, { useLayoutEffect, useState } from 'react';

import { Skeleton } from '../skeleton';

import { highlight } from './shared';

import type { JSX } from 'react';
import type { BundledLanguage, Highlighter } from './shiki.bundle.ts';

interface Props {
  value: string;
  lang: BundledLanguage;
  initial?: JSX.Element;
  highlighter?: Highlighter;
}

export const Code: React.FC<Props> = ({
  value,
  initial,
  lang,
  highlighter,
}) => {
  const [nodes, setNodes] = useState(initial);

  useLayoutEffect(() => {
    void highlight(value, lang, highlighter)
      .then(setNodes)
      .catch(e => {
        console.error(e);
        setNodes(
          <code
            className={
              'w-full max-w-full overflow-x-auto p-4 whitespace-pre-wrap'
            }
          >
            {value}
          </code>
        );
      });
  }, [value, lang, highlighter]);

  return (
    <>
      <style>{`
        .shiki {
          padding: 1rem;
          overflow-x: auto;
          background-color: var(--transparent) !important;
          scrollbar-width: none;
          -ms-overflow-style: none;
          &::-webkit-scrollbar {
            display: none;
          }
            font-size: 12px;
        }

        .shiki .line {
          padding-left: 0rem !important;
          padding-right: 0rem !important;
        }

        @media (max-width: 768px) {
          .shiki {
            padding: 0.5rem;
            font-size: 12px;
          }
        }

        html.dark .shiki,
            html.dark .shiki span {
            color: var(--shiki-dark) !important;
            /* Optional, if you also want font styles */
            font-style: var(--shiki-dark-font-style) !important;
            font-weight: var(--shiki-dark-font-weight) !important;
            text-decoration: var(--shiki-dark-text-decoration) !important;
            }

      `}</style>
      {nodes ?? <Skeleton className="h-10 w-full" />}
    </>
  );
};
