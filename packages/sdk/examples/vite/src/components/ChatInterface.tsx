import { useEcho, useEchoModelProviders } from '@merit-systems/echo-react-sdk';
import { generateText, type ModelMessage } from 'ai';
import { useState } from 'react';

export function ChatInterface() {
  const [messages, setMessages] = useState<ModelMessage[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const { openai } = useEchoModelProviders();
  const { user, isLoading } = useEcho();

  const handleSendMessage = async () => {
    if (!input.trim() || isGenerating || !user) return;

    setIsGenerating(true);
    const userMessage = input.trim();
    setInput('');
    const newMessages: ModelMessage[] = [
      ...messages,
      { role: 'user', content: userMessage },
    ];
    setMessages(newMessages);

    try {
      const result = await generateText({
        model: openai('gpt-5'),
        messages: newMessages,
      });

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: result.text,
        },
      ]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `Error: ${errorMessage}` },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!user && isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading Echo providers...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Please sign in to start chatting.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-lg mb-4">
        {messages.length === 0 ? (
          <div className="text-gray-500 text-center italic">
            Start a conversation...
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-800 border'
                }`}
              >
                {typeof message.content === 'string'
                  ? message.content
                  : Array.isArray(message.content)
                    ? message.content.map((part, partIndex) => {
                        if ('text' in part) {
                          return <span key={partIndex}>{part.text}</span>;
                        }
                        return null;
                      })
                    : String(message.content)}
              </div>
            </div>
          ))
        )}
        {isGenerating && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 border px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-pulse">Thinking...</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isGenerating}
        />
        <button
          onClick={handleSendMessage}
          disabled={!input.trim() || isGenerating}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
