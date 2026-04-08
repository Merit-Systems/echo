import React from 'react';
import { PaymentMethod, usePaymentMethod } from '../context/PaymentMethodContext';

const AuthSwitcher: React.FC = () => {
  const { selectedMethod, setMethod } = usePaymentMethod();

  return (
    <div className="p-4 bg-gray-50 shadow-md rounded-lg mb-4 flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
      <button
        className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
          selectedMethod === PaymentMethod.ECHO_CREDITS
            ? 'bg-blue-600 text-white shadow hover:bg-blue-700'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`}
        onClick={() => setMethod(PaymentMethod.ECHO_CREDITS)}
      >
        Pay with Echo Credits
      </button>
      <button
        className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
          selectedMethod === PaymentMethod.X402_USDC
            ? 'bg-green-600 text-white shadow hover:bg-green-700'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`}
        onClick={() => setMethod(PaymentMethod.X402_USDC)}
      >
        Pay with USDC (x402)
      </button>
    </div>
  );
};

export default AuthSwitcher;
