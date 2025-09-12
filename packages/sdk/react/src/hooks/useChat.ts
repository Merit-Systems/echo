import { useChat as useChatBase } from '@ai-sdk/react';
import { convertToModelMessages, type ChatTransport, type UIMessage } from 'ai';
import { useEchoChatConfig } from '../components/EchoChatProvider';

function createInMemoryChatTransport(): ChatTransport<UIMessage> {
  const chatFn = useEchoChatConfig();
  return {
    async sendMessages(params) {
      const { messages, abortSignal, ...rest } = params;
      const coreMessages = convertToModelMessages(
        messages.map(({ role, parts, metadata }) => ({ role, parts, metadata }))
      );

      return await chatFn({
        uiMessages: messages,
        modelMessages: coreMessages,
        abortSignal,
        ...rest,
      });
    },
    async reconnectToStream() {
      return null;
    },
  };
}

export function useChat() {
  const transport = createInMemoryChatTransport();
  return useChatBase({ transport });
}
