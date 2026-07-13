import React, { useState } from 'react';
import { PaymentMethod, usePaymentMethod } from '../context/PaymentMethodContext';

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'bot';
};

const ChatUI: React.FC = () => {
  const { selectedMethod } = usePaymentMethod();
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: `Welcome! Currently, your chat interactions would utilize ${selectedMethod.replace('_', ' ')}.`, sender: 'bot' },
  ]);
  const [input, setInput] = useState('');

  const handleSendMessage = () => {
    if (input.trim()) {
      const newUserMessage: Message = { id: messages.length + 1, text: input, sender: 'user' };
      setMessages((prevMessages) => [...prevMessages, newUserMessage]);
      setInput('');

      // Simulate bot response and payment method usage
      setTimeout(() => {
        const botResponseText = `You sent "${input}". This message is hypothetically processed using ${selectedMethod.replace('_', ' ')}.`;
        const botResponse: Message = {
          id: messages.length + 2,
          text: botResponseText,
          sender: 'bot',
        };
        setMessages((prevMessages) => [...prevMessages, botResponse]);
      }, 500);
    }
  };

  return (
    <div className="flex flex-col h-[70vh] bg-gray-100 rounded-lg shadow-inner overflow-hidden border border-gray-200">
      <div className="p-3 bg-blue-700 text-white text-center text-sm font-medium flex items-center justify-center">
        Current Payment Method: <span className="font-bold ml-2">{selectedMethod.replace('_', ' ')}</span>
      </div>
      <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs p-3 rounded-lg ${
                msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-800'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <div className="flex p-4 border-t bg-white">
        <input
          type="text"
          className="flex-grow p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={handleSendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatUI;
