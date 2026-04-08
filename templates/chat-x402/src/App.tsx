import React from 'react';
import ChatUI from './components/ChatUI';
import AuthSwitcher from './components/AuthSwitcher';
import { PaymentMethodProvider } from './context/PaymentMethodContext';
import './index.css'; // Ensure tailwind CSS is imported

const App: React.FC = () => {
  return (
    <PaymentMethodProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Chat with X402 Payment Options</h1>
        <div className="w-full max-w-2xl bg-white shadow-xl rounded-xl p-6">
          <AuthSwitcher />
          <ChatUI />
        </div>
      </div>
    </PaymentMethodProvider>
  );
};

export default App;
