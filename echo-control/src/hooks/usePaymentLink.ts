import { useState } from 'react';

interface CreatePaymentLinkParams {
  amount?: number;
  description?: string;
}

interface PaymentLinkResponse {
  paymentLink: {
    url: string;
  };
}

export const usePaymentLink = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaymentLink = async ({
    amount = 10,
    description,
  }: CreatePaymentLinkParams = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          description: description || `Echo Credits - $${amount}`,
        }),
      });

      if (response.ok) {
        const result: PaymentLinkResponse = await response.json();
        window.location.href = result.paymentLink.url;
      } else {
        const errorText = await response.text();
        console.error('Error creating payment link:', errorText);
        setError('Failed to create payment link');
      }
    } catch (error) {
      console.error('Error creating payment link:', error);
      setError('Failed to create payment link');
    } finally {
      setLoading(false);
    }
  };

  return {
    createPaymentLink,
    loading,
    error,
  };
};

interface CreateCreditGrantInvoiceParams {
  amount?: number;
  description?: string;
  successUrl?: string;
}

interface CreditGrantInvoiceResponse {
  paymentLink: string;
  invoiceId: string;
  amount: number;
  description: string;
}

export const useCreditGrantInvoicePaymentLink = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCreditGrantInvoice = async ({
    amount = 10,
    description,
    successUrl,
  }: CreateCreditGrantInvoiceParams = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        '/api/stripe/payment-link/credit-grant-invoice',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amountInCents: amount * 100, // Convert dollars to cents
            description: description || `Echo Credits - $${amount}`,
            successUrl,
          }),
        }
      );

      if (response.ok) {
        const result: CreditGrantInvoiceResponse = await response.json();
        return result;
      } else {
        const errorText = await response.text();
        console.error(
          'Error creating credit grant invoice payment link:',
          errorText
        );
        setError('Failed to create credit grant invoice payment link');
        return null;
      }
    } catch (error) {
      console.error('Error creating credit grant invoice payment link:', error);
      setError('Failed to create credit grant invoice payment link');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createCreditGrantInvoice,
    loading,
    error,
  };
};
