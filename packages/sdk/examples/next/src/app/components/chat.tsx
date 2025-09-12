'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';

export default function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage } = useChat();
  return (
    <div className="space-y-4">
      {/* Messages */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {messages.map(message => (
          <div
            key={message.id}
            className={`p-3 rounded-lg ${
              message.role === 'user'
                ? 'bg-primary/10 border border-primary/20'
                : 'bg-muted border'
            }`}
          >
            <div className="font-medium text-sm text-muted-foreground mb-1">
              {message.role === 'user' ? 'You' : 'Assistant'}
            </div>
            <div className="text-foreground whitespace-pre-wrap">
              {message.parts.map((part, i) => {
                switch (part.type) {
                  case 'text':
                    return <div key={`${message.id}-${i}`}>{part.text}</div>;
                }
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={e => {
          e.preventDefault();
          sendMessage({ text: input });
          setInput('');
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={e => setInput(e.currentTarget.value)}
          placeholder="Type your message..."
          className="flex-1 px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  );
}
