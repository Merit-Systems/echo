'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { Loader } from '@/components/ai-elements/loader';
import { Message, MessageContent } from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
} from '@/components/ai-elements/prompt-input';

type PaymentMethod = 'echo' | 'usdc';

interface AuthSwitcherProps {
  currentMethod: PaymentMethod;
  onSwitch: (method: PaymentMethod) => void;
}

function AuthSwitcher({ currentMethod, onSwitch }: AuthSwitcherProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-2 dark:bg-gray-800">
      <span className="text-sm text-gray-600 dark:text-gray-400">
        Pay with:
      </span>
      <button
        onClick={() => onSwitch('echo')}
        className={`rounded-md px-3 py-1 text-sm transition-colors ${
          currentMethod === 'echo'
            ? 'bg-blue-500 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
        }`}
      >
        Echo Credits
      </button>
      <button
        onClick={() => onSwitch('usdc')}
        className={`rounded-md px-3 py-1 text-sm transition-colors ${
          currentMethod === 'usdc'
            ? 'bg-blue-500 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
        }`}
      >
        USDC (x402)
      </button>
    </div>
  );
}

const ChatX402 = () => {
  const [input, setInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('echo');
  const { messages, sendMessage, status, error } = useChat({
    api: '/api/chat-x402',
    body: {
      paymentMethod,
    },
    onError: (err) => {
      console.error('Chat error:', err);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && status !== 'streaming') {
      sendMessage({ text: input });
      setInput('');
    }
  };

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col gap-4 p-4">
      <AuthSwitcher
        currentMethod={paymentMethod}
        onSwitch={setPaymentMethod}
      />

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {error.message.includes('402')
            ? 'Payment required. Please add funds to continue.'
            : error.message}
        </div>
      )}

      <div className="flex-1 space-y-4 overflow-y-auto">
        {messages.map((message) => (
          <Message key={message.id} from={message.role === 'user' ? 'user' : 'assistant'}>
            <MessageContent>{message.content}</MessageContent>
          </Message>
        ))}
        {status === 'streaming' && <Loader />}
      </div>

      <form onSubmit={handleSubmit} className="sticky bottom-0">
        <PromptInput>
          <PromptInputTextarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
          />
          <PromptInputSubmit disabled={!input.trim() || status === 'streaming'} />
        </PromptInput>
      </form>
    </div>
  );
};

export default ChatX402;
