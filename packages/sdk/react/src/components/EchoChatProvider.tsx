import type { ChatTransport, UIMessage, UIMessageChunk } from 'ai';
import { type ModelMessage } from 'ai';
import { createContext, useContext } from 'react';

// Derive the transport send types directly from AI SDK
type ChatSendParams = Parameters<ChatTransport<UIMessage>['sendMessages']>[0];

export type EchoChatBuildContext = Pick<
  ChatSendParams,
  'trigger' | 'chatId' | 'messageId' | 'abortSignal'
> & {
  uiMessages: UIMessage[];
  modelMessages: ModelMessage[];
};

// Single async function returning a UI message chunk stream (in-memory)
export type EchoChatFn = (
  ctx: EchoChatBuildContext
) => Promise<ReadableStream<UIMessageChunk>> | ReadableStream<UIMessageChunk>;

const EchoChatConfigContext = createContext<EchoChatFn | null>(null);

export function EchoChatProvider({
  chatFn,
  children,
}: {
  chatFn: EchoChatFn;
  children: React.ReactNode;
}) {
  return (
    <EchoChatConfigContext.Provider value={chatFn}>
      {children}
    </EchoChatConfigContext.Provider>
  );
}

export function useEchoChatConfig(): EchoChatFn {
  const fn = useContext(EchoChatConfigContext);
  if (!fn) {
    throw new Error('useChat must be used within an EchoChatProvider');
  }
  return fn;
}
