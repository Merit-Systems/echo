// .source folder will be generated when you run `next dev`
import { docs } from '@/../.source';
import { loader } from 'fumadocs-core/source';
import { icons } from 'lucide-react';
import { createElement } from 'react';
import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiOpenai,
} from '@icons-pack/react-simple-icons';

// Centralized icon mapping for react-simple-icons
const simpleIconsMap = {
  React: SiReact,
  Nextdotjs: SiNextdotjs,
  TypeScript: SiTypescript,
  Openai: SiOpenai,
} as const;

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  icon(icon) {
    if (!icon) {
      // You may set a default icon
      return;
    }

    // Check for react-simple-icons first
    if (icon in simpleIconsMap) {
      return createElement(
        simpleIconsMap[icon as keyof typeof simpleIconsMap],
        {
          className: 'text-primary',
        }
      );
    }

    // Fallback to lucide-react icons
    if (icon in icons) {
      return createElement(icons[icon as keyof typeof icons], {
        className: 'text-primary',
      });
    }
  },
});
