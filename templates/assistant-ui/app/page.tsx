'use client';

import { Thread } from '@/components/assistant-ui/thread';
import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { useChatRuntime } from '@assistant-ui/react-ai-sdk';
import { Header } from '@/components/header';

export default function Home() {
  // Using the new simplified useChatRuntime hook
  const runtime = useChatRuntime();

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="h-full flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 min-h-0">
          <Thread />
        </main>
      </div>
    </AssistantRuntimeProvider>
  );
}
