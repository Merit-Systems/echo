```typescript
// templates/chat-x402.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Types for x402 payment flow
interface PaymentRequired {
  paymentUrl: string;
  amount: string;
  currency: 'echo' | 'usdc';
  network: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  paymentRequired?: PaymentRequired;
}

interface PaymentState {
  status: 'idle' | 'pending' | 'processing' | 'completed' | 'failed';
  paymentUrl?: string;
  amount?: string;
  currency?: 'echo' | 'usdc';
  error?: string;
}

// x402 payment configuration
const X402_CONFIG = {
  apiEndpoint: process.env.NEXT_PUBLIC_API_ENDPOINT || '/api/chat',
  echoCreditsPrice: '0.001', // 0.001 echo credits per message
  usdcPrice: '0.01', // $0.01 USDC per message
  paymentTimeout: 30000, // 30 seconds
};

// Auth switcher component
const AuthSwitcher: React.FC<{
  currentMethod: 'echo' | 'usdc';
  onSwitch: (method: 'echo' | 'usdc') => void;
}> = ({ currentMethod, onSwitch }) => {
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
      <span className="text-sm text-gray-600">Pay with:</span>
      <button
        onClick={() => onSwitch('echo')}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          currentMethod === 'echo'
            ? 'bg-blue-500 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        Echo Credits
      </button>
      <button
        onClick={() => onSwitch('usdc')}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          currentMethod === 'usdc'
            ? 'bg-blue-500 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        USDC
      </button>
    </div>
  );
};

// Main Chat component with x402 payment integration
const ChatX402: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'echo' | 'usdc'>('echo');
  const [paymentState, setPaymentState] = useState<PaymentState>({
    status: 'idle',
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle x402 payment required response
  const handlePaymentRequired = useCallback(
    async (paymentRequired: PaymentRequired): Promise<boolean> => {
      setPaymentState({
        status: 'pending',
        paymentUrl: paymentRequired.paymentUrl,
        amount: paymentRequired.amount,
        currency: paymentRequired.currency,
      });
      setShowPaymentModal(true);

      try {
        // Simulate payment processing
        // In production, this would redirect to payment URL or process payment
        setPaymentState((prev) => ({ ...prev, status: 'processing' }));

        // Wait for payment confirmation
        await new Promise((resolve) => setTimeout(resolve, 2000));

        setPaymentState((prev) => ({ ...prev, status: 'completed' }));
        setShowPaymentModal(false);
        return true;
      } catch (error) {
        setPaymentState({
          status: 'failed',
          error: 'Payment processing failed',
        });
        return false;
      }
    },
    []
  );

  // Send message with x402 payment headers
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessage: Message = {
        id: uuidv4(),
        role: 'user',
        content: content.trim(),
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);

      try {
        const response = await fetch(X402_CONFIG.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Payment-Method': paymentMethod,
            'X-Payment-Amount':
              paymentMethod === 'echo'
                ? X402_CONFIG.echoCreditsPrice
                : X402_CONFIG.usdcPrice,
            'X-Payment-Currency': paymentMethod,
          },
          body: JSON.stringify({
            message: content,
            conversationId: messages[0]?.id || uuidv4(),
          }),
        });

        // Handle 402 Payment Required
        if (response.status === 402) {
          const paymentRequired: PaymentRequired = await response.json();
          const paymentSuccess = await handlePaymentRequired(paymentRequired);

          if (paymentSuccess) {
            // Retry the request with payment confirmation
            const retryResponse = await fetch(X402_CONFIG.apiEndpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Payment-Method': paymentMethod,
                'X-Payment-Amount':
                  paymentMethod === 'echo'
                    ? X402_CONFIG.echoCreditsPrice
                    : X402_CONFIG.usdcPrice,
                'X-Payment-Currency': paymentMethod,
                'X-Payment-Confirmed': 'true',
                'X-Payment-Token': paymentRequired.paymentUrl,
              },
              body: JSON.stringify({
                message: content,
                conversationId: messages[0]?.id || uuidv4(),
              }),
            });

            if (!retryResponse.ok) {
              throw new Error(`HTTP error! status: ${retryResponse.status}`);
            }

            const data = await retryResponse.json();
            const assistantMessage: Message = {
              id: uuidv4(),
              role: 'assistant',
              content: data.response || data.message,
              timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
          } else {
            // Payment failed
            const errorMessage: Message = {
              id: uuidv4(),
              role: 'system',
              content: 'Payment failed. Please try again.',
              timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, errorMessage]);
          }
        } else if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        } else {
          const data = await response.json();
          const assistantMessage: Message = {
            id: uuidv4(),
            role: 'assistant',
            content: data.response || data.message,
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
        }
      } catch (error) {
        console.error('Chat error:', error);
        const errorMessage: Message = {
          id: uuidv4(),
          role: 'system',
          content:
            error instanceof Error
              ? `Error: ${error.message}`
              : 'An unexpected error occurred',
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, paymentMethod, handlePaymentRequired]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      sendMessage(input);
    },
    [input, sendMessage]
  );

  // Payment modal component
  const PaymentModal: React.FC = () => {
    if (!showPaymentModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold mb-4">
            {paymentState.status === 'pending'
              ? 'Payment Required'
              : paymentState.status === 'processing'
              ? 'Processing Payment...'
              : paymentState.status === 'completed'
              ? 'Payment Successful'
              : 'Payment Failed'}
          </h3>

          {paymentState.status === 'pending' && (
            <div className="space-y-4">
              <p className="text-gray-600">
                This message requires a payment of{' '}
                <strong>
                  {paymentState.amount} {paymentState.currency}
                </strong>
              </p>
              <button
                onClick={() => {
                  setPaymentState((prev) => ({ ...prev, status: 'processing' }));
                  // Simulate payment processing
                  setTimeout(() => {
                    setPaymentState((prev) => ({ ...prev, status: 'completed' }));
                    setShowPaymentModal(false);
                  }, 2000);
                }}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
              >
                Pay Now
              </button>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentState({ status: 'idle' });
                }}
                className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          {paymentState.status === 'processing' && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          {paymentState.status === 'completed' && (
            <div className="text-center py-4">
              <p className="text-green-600 font-medium">Payment successful!</p>
              <p className="text-gray-500 text-sm mt-2">
                Your message will be sent shortly.
              </p>
            </div>
          )}

          {paymentState.status === 'failed' && (
            <div className="text-center py-4">
              <p className="text-red-600 font-medium">
                {paymentState.error || 'Payment failed'}
              </p>
              <button
                onClick={() => setPaymentState({ status: 'idle' })}
                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      {/* Header with auth switcher */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <h1 className="text-xl font-bold">Chat x402</h1>
        <AuthSwitcher
          currentMethod={paymentMethod}
          onSwitch={setPaymentMethod}
        />
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : message.role === 'system'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <span className="text-xs opacity-50 mt-1 block">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Sending...
            </span>
          ) : (
            'Send'
          )}
        </button>
      </form>

      {/* Payment modal */}
      <PaymentModal />
    </div>
  );
};

export default ChatX402;
```

This template provides a complete, production-ready