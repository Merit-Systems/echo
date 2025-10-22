import { SiNextdotjs, SiReact } from '@icons-pack/react-simple-icons';
import type { Route } from 'next';

interface Integration {
  name: string;
  icon: React.ReactNode;
  content: string;
  href: Route;
}

export const integrations: Integration[] = [
  {
    name: 'Next.js',
    icon: <SiNextdotjs className="size-4" />,
    href: '/docs/getting-started/next-js' as Route,
    content: `// echo.ts
import { Echo } from '@merit-systems/echo-next-sdk';

export const { 
  handlers, 
  generateText,
  signIn
} = Echo({
    appId: "your-app-id"
});

// api/echo/[...echo].ts
export const { GET, POST } = handlers;`,
  },
  {
    name: 'React',
    icon: <SiReact className="size-4" />,
    href: '/docs/getting-started/react' as Route,
    content: `// app.tsx
import { EchoProvider } from '@merit-systems/echo-react-sdk';

<EchoProvider appId={appId}>
    // your app
</EchoProvider>

// chat.tsx
import { streamText } from '@merit-systems/echo-react';

const response = await streamText({
    model: "gpt-5",
    prompt: "Hello, how are you?",
})`,
  },
];
