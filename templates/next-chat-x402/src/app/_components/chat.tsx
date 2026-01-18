'use client';

import { CopyIcon, MessageSquare, ChevronDown } from 'lucide-react';
import { Fragment, useState, useEffect, useRef } from 'react';
import { useChatWithPayment } from '@merit-systems/ai-x402';
import { useAccount, useSwitchChain, useWalletClient } from 'wagmi';
import { base } from 'wagmi/chains';
import { useScrollable } from '@/lib/use-scrollable';
import { Action, Actions } from '@/components/ai-elements/actions';
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Loader } from '@/components/ai-elements/loader';
import { Message, MessageContent } from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning';
import { Response } from '@/components/ai-elements/response';
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@/components/ai-elements/sources';
import { Suggestion, Suggestions } from '@/components/ai-elements/suggestion';
import { Button } from '@/components/ui/button';
import { Signer } from 'x402/types';

const models = [
  {
    name: 'GPT 4o',
    value: 'gpt-4o',
  },
  {
    name: 'GPT 5',
    value: 'gpt-5',
  },
];

const suggestions = [
  'Can you explain how to play tennis?',
  'Write me a code snippet of how to use the vercel ai sdk to create a chatbot',
  'How do I make a really good fish taco?',
];

const ChatBotDemo = () => {
  const [input, setInput] = useState('');
  const [model, setModel] = useState<string>(models[0].value);
  const [isDismissed, setIsDismissed] = useState(false);
  const { data: walletClient } = useWalletClient();
  const { chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const conversationContentRef = useRef<HTMLDivElement>(null);
  const { isScrollable, scrollToBottom } = useScrollable(conversationContentRef);
  const { messages, sendMessage, status, error } = useChatWithPayment({
    walletClient: walletClient as Signer,
    regenerateOptions: {
      body: { model },
      headers: { 'use-x402': 'true' },
    },
  });

  const ensureBaseChain = async () => {
    try {
      if (chain?.id !== base.id) {
        await switchChainAsync({ chainId: base.id });
      }
    } catch {
      // ignore; user may cancel switch prompt
    }
  };

  const isPaymentRequiredError = (err: unknown): boolean => {
    if (!err || typeof err !== 'object') return false;
    const maybeError = err as { message?: string };
    if (!maybeError.message) return false;
    try {
      const parsed = JSON.parse(maybeError.message);
      const hasVersion =
        parsed && typeof parsed.x402Version === 'number';
      const hasAccepts = Array.isArray(parsed?.accepts);
      return !!(hasVersion && hasAccepts);
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      if (walletClient) {
        await ensureBaseChain();
      }
      sendMessage(
        { text: input },
        {
          body: {
            model: model,
          },
          headers: walletClient ? { 'use-x402': 'true' } : {},
        }
      );
      setInput('');
      // Scroll to bottom when submitting a new message
      setTimeout(() => scrollToBottom(), 100);
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    if (walletClient) {
      await ensureBaseChain();
    }
    sendMessage(
      { text: suggestion },
      {
        body: {
          model: model,
        },
        headers: walletClient ? { 'use-x402': 'true' } : {},
      }
    );
    // Scroll to bottom when submitting a new message
    setTimeout(() => scrollToBottom(), 100);
  };

  const handleDismissError = () => {
    setIsDismissed(true);
  };

  // Reset dismissed state when sending a new message
  useEffect(() => {
    if (status === 'submitted') {
      setIsDismissed(false);
    }
  }, [status]);

  // Scroll to bottom when a new message is added
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [messages.length, scrollToBottom]);

  return (
    <div className="mx-auto flex flex-col h-full! flex-1 max-w-4xl p-6">
      <div className="flex flex-1 h-full min-h-0 flex-col">
        <Conversation className="relative min-h-0 w-full flex-1 overflow-hidden">
          <div ref={conversationContentRef} className="h-[72vh] overflow-y-auto relative">
            <ConversationContent>
              {messages.length === 0 ? (
              <ConversationEmptyState
                icon={<MessageSquare className="size-12" />}
                title="No messages yet"
                description="Start a conversation to see messages here"
              />
            ) : (
              messages.map(message => (
                <div key={message.id}>
                  {message.role === 'assistant' &&
                    message.parts.filter(part => part.type === 'source-url')
                      .length > 0 && (
                      <Sources>
                        <SourcesTrigger
                          count={
                            message.parts.filter(
                              part => part.type === 'source-url'
                            ).length
                          }
                        />
                        {message.parts
                          .filter(part => part.type === 'source-url')
                          .map((part, i) => (
                            <SourcesContent key={`${message.id}-${i}`}>
                              <Source
                                key={`${message.id}-${i}`}
                                href={part.url}
                                title={part.url}
                              />
                            </SourcesContent>
                          ))}
                      </Sources>
                    )}
                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case 'text':
                        return (
                          <Fragment key={`${message.id}-${i}`}>
                            <Message from={message.role}>
                              <MessageContent>
                                <Response key={`${message.id}-${i}`}>
                                  {part.text}
                                </Response>
                              </MessageContent>
                            </Message>
                            {message.role === 'assistant' &&
                              i === messages.length - 1 && (
                                <Actions className="mt-2">
                                  <Action
                                    onClick={() =>
                                      navigator.clipboard.writeText(part.text)
                                    }
                                    label="Copy"
                                  >
                                    <CopyIcon className="size-3" />
                                  </Action>
                                </Actions>
                              )}
                          </Fragment>
                        );
                      case 'reasoning':
                        return (
                          <Reasoning
                            key={`${message.id}-${i}`}
                            className="w-full"
                            isStreaming={
                              status === 'streaming' &&
                              i === message.parts.length - 1 &&
                              message.id === messages.at(-1)?.id
                            }
                          >
                            <ReasoningTrigger />
                            <ReasoningContent>{part.text}</ReasoningContent>
                          </Reasoning>
                        );
                      default:
                        return null;
                    }
                  })}
                </div>
              ))
            )}
            {status === 'submitted' && <Loader />}
            </ConversationContent>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none bg-linear-to-t from-background to-transparent" />
          {isScrollable && (
            <Button
              onClick={scrollToBottom}
              size="icon"
              variant="outline"
              className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 rounded-full"
              aria-label="Scroll to bottom"
            >
              <ChevronDown className="h-5 w-5" />
            </Button>
          )}
          <ConversationScrollButton />
        </Conversation>
        
        {error && !isDismissed && !isPaymentRequiredError(error) && (
          <div className="mt-4 mb-2 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-200">
                  Error
                </h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap">
                  {error?.message || 'An error occurred while processing your request.'}
                </p>
              </div>
              <button
                onClick={handleDismissError}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200"
                aria-label="Dismiss error"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        <Suggestions>
          {suggestions.map(suggestion => (
            <Suggestion
              key={suggestion}
              onClick={handleSuggestionClick}
              suggestion={suggestion}
            />
          ))}
        </Suggestions>

        <PromptInput onSubmit={handleSubmit} className="mt-4 shrink-0">
          <PromptInputTextarea
            onChange={e => setInput(e.target.value)}
            value={input}
          />
          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputModelSelect
                onValueChange={value => {
                  setModel(value);
                }}
                value={model}
              >
                <PromptInputModelSelectTrigger>
                  <PromptInputModelSelectValue />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {models.map(model => (
                    <PromptInputModelSelectItem
                      key={model.value}
                      value={model.value}
                    >
                      {model.name}
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
            </PromptInputTools>
            <PromptInputSubmit disabled={!input} status={status} />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
};

export default ChatBotDemo;
