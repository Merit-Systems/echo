import React, { createContext, useContext, useState, ReactNode } from 'react';

export enum PaymentMethod {
  ECHO_CREDITS = 'ECHO_CREDITS',
  X402_USDC = 'X402_USDC',
}

interface PaymentMethodContextType {
  selectedMethod: PaymentMethod;
  setMethod: (method: PaymentMethod) => void;
}

const PaymentMethodContext = createContext<PaymentMethodContextType | undefined>(undefined);

export const PaymentMethodProvider = ({ children }: { children: ReactNode }) => {
  const [selectedMethod, setMethod] = useState<PaymentMethod>(PaymentMethod.ECHO_CREDITS);

  return (
    <PaymentMethodContext.Provider value={{ selectedMethod, setMethod }}>
      {children}
    </PaymentMethodContext.Provider>
  );
};

export const usePaymentMethod = () => {
  const context = useContext(PaymentMethodContext);
  if (context === undefined) {
    throw new Error('usePaymentMethod must be used within a PaymentMethodProvider');
  }
  return context;
};
