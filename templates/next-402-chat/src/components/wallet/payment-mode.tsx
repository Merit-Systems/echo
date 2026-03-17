'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'echo-chat-payment-mode';

export type PaymentMode = 'credits' | 'x402';

interface PaymentModeContextValue {
  paymentMode: PaymentMode;
  setPaymentMode: (mode: PaymentMode) => void;
}

const PaymentModeContext = createContext<PaymentModeContextValue | null>(null);

export function PaymentModeProvider({ children }: { children: ReactNode }) {
  const [paymentMode, setPaymentModeState] = useState<PaymentMode>('credits');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'credits' || stored === 'x402') {
      setPaymentModeState(stored);
    }
  }, []);

  const value = useMemo(
    () => ({
      paymentMode,
      setPaymentMode: (mode: PaymentMode) => {
        setPaymentModeState(mode);
        localStorage.setItem(STORAGE_KEY, mode);
      },
    }),
    [paymentMode]
  );

  return (
    <PaymentModeContext.Provider value={value}>
      {children}
    </PaymentModeContext.Provider>
  );
}

export function usePaymentMode() {
  const context = useContext(PaymentModeContext);

  if (!context) {
    throw new Error('usePaymentMode must be used within a PaymentModeProvider');
  }

  return context;
}
