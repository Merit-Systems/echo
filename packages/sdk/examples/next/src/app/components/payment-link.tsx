'use client';
import { useEcho } from '@merit-systems/echo-next-sdk/client';
import { useState } from 'react';

interface PaymentLinkProps {
  amount?: number;
  description?: string;
}

export const PaymentLink = ({
  amount = 10,
  description = 'Credits',
}: PaymentLinkProps) => {
  const echoClient = useEcho();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreatePaymentLink = async () => {
    setLoading(true);
    setError(null);

    try {
      const paymentResponse = await echoClient.payments.createPaymentLink({
        amount,
        description,
      });

      // Open the payment link in a new window
      window.open(paymentResponse.paymentLink.url, '_blank');
    } catch (err) {
      console.error('Error creating payment link:', err);
      setError('Failed to create payment link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleCreatePaymentLink}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-md transition-colors duration-200"
      >
        {loading ? 'Creating Payment Link...' : `Buy $${amount} Credits`}
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};
