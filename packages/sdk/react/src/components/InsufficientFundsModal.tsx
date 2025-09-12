import { useEffect, useRef, useState } from 'react';
import { useEcho } from '../hooks/useEcho';
import { openPaymentFlow } from '../utils/security';
import { Logo } from './Logo';

interface InsufficientFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseComplete?: () => void;
  onError?: ((error: Error) => void) | undefined;
}

// Separate component for custom amount input to prevent parent re-renders
const CustomAmountInput = ({
  onAddCredits,
  onCancel,
  isProcessing,
}: {
  onAddCredits: (amount: number) => void;
  onCancel: () => void;
  isProcessing: boolean;
}) => {
  const [amount, setAmount] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleAddCredits = () => {
    const purchaseAmount = Number(amount);
    if (purchaseAmount > 0) {
      onAddCredits(purchaseAmount);
    }
  };

  const isValidAmount = amount !== '' && Number(amount) > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          style={{
            fontSize: '14px',
            color: '#6b7280',
            fontFamily: 'HelveticaNowDisplay, sans-serif',
          }}
        >
          $
        </span>
        <input
          ref={inputRef}
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="0.00"
          min="1"
          step="0.01"
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'HelveticaNowDisplay, sans-serif',
            outline: 'none',
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' && isValidAmount && !isProcessing) {
              handleAddCredits();
            } else if (e.key === 'Escape') {
              onCancel();
            }
          }}
        />
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: '#6b7280',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer',
            fontFamily: 'HelveticaNowDisplay, sans-serif',
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleAddCredits}
          disabled={!isValidAmount || isProcessing}
          style={{
            flex: 1,
            padding: '8px 16px',
            backgroundColor:
              isValidAmount && !isProcessing ? '#dc2626' : '#9ca3af',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: isValidAmount && !isProcessing ? 'pointer' : 'not-allowed',
            fontFamily: 'HelveticaNowDisplay, sans-serif',
          }}
        >
          {isProcessing ? 'Processing...' : 'Add Credits'}
        </button>
      </div>
    </div>
  );
};

export function InsufficientFundsModal({
  isOpen,
  onClose,
  onPurchaseComplete,
  onError,
}: InsufficientFundsModalProps) {
  const { createPaymentLink, user, refreshBalance } = useEcho();
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [showCustomAmount, setShowCustomAmount] = useState(false);

  const handlePurchase = async (amount: number) => {
    if (!user) {
      const error = new Error('Please sign in to purchase tokens');
      setPurchaseError(error.message);
      onError?.(error);
      return;
    }

    try {
      setIsProcessing(true);
      setPurchaseError(null);

      const paymentUrl = await createPaymentLink(amount);

      await openPaymentFlow(paymentUrl, {
        onComplete: async () => {
          try {
            await refreshBalance();
            onPurchaseComplete?.();
            onClose();
          } catch (refreshError) {
            console.error('Failed to refresh balance:', refreshError);
          }
        },
        onError: (error: Error) => {
          setPurchaseError(error.message);
          onError?.(error);
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Purchase failed';
      setPurchaseError(errorMessage);
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
        margin: 0,
        boxSizing: 'border-box',
        // CSS reset to prevent inheritance issues
        border: 'none',
        outline: 'none',
        textDecoration: 'none',
        listStyle: 'none',
      }}
      onClick={e => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          padding: '0',
          margin: '0',
          width: '100%',
          maxWidth: '450px',
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow:
            '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          fontFamily: 'HelveticaNowDisplay, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '320px',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div style={{ padding: '16px 16px 0 16px', marginBottom: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Logo width={20} height={20} variant="light" />
            <h2
              style={{
                fontSize: '18px',
                fontWeight: '500',
                color: '#111827',
                margin: 0,
                fontFamily: 'HelveticaNowDisplay, sans-serif',
              }}
            >
              Insufficient Balance
            </h2>
          </div>
        </div>

        <div style={{ padding: '0 16px 16px 16px' }}>
          <p
            style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '0 0 12px 0',
              fontFamily: 'HelveticaNowDisplay, sans-serif',
            }}
          >
            You don't have enough credits to complete this request. Please add
            credits to your account.
          </p>
        </div>

        {/* Add Credits Section */}
        <div
          style={{
            padding: '0 16px 16px 16px',
            borderTop: '1px solid #f3f4f6',
            paddingTop: '16px',
          }}
        >
          {!showCustomAmount ? (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <button
                onClick={() => handlePurchase(10)}
                disabled={isProcessing}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: isProcessing ? '#9ca3af' : '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s ease',
                  fontFamily: 'HelveticaNowDisplay, sans-serif',
                }}
                onMouseEnter={e => {
                  if (!isProcessing) {
                    e.currentTarget.style.backgroundColor = '#b91c1c';
                  }
                }}
                onMouseLeave={e => {
                  if (!isProcessing) {
                    e.currentTarget.style.backgroundColor = '#dc2626';
                  }
                }}
              >
                {isProcessing ? 'Processing...' : 'Add $10.00'}
              </button>
              <button
                onClick={() => setShowCustomAmount(true)}
                disabled={isProcessing}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  color: '#dc2626',
                  border: '1px solid #dc2626',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  fontFamily: 'HelveticaNowDisplay, sans-serif',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  if (!isProcessing) {
                    e.currentTarget.style.backgroundColor = '#fef2f2';
                    e.currentTarget.style.borderColor = '#b91c1c';
                  }
                }}
                onMouseLeave={e => {
                  if (!isProcessing) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = '#dc2626';
                  }
                }}
              >
                Custom Amount
              </button>
            </div>
          ) : (
            <CustomAmountInput
              onAddCredits={handlePurchase}
              onCancel={() => setShowCustomAmount(false)}
              isProcessing={isProcessing}
            />
          )}
        </div>

        {/* Error Message */}
        {purchaseError && (
          <div style={{ padding: '0 16px 16px 16px' }}>
            <div
              style={{
                padding: '8px 12px',
                backgroundColor: '#fef2f2',
                borderRadius: '6px',
                border: '1px solid #fecaca',
              }}
            >
              <p
                style={{
                  color: '#dc2626',
                  margin: 0,
                  fontSize: '12px',
                  fontFamily: 'HelveticaNowDisplay, sans-serif',
                }}
              >
                {purchaseError}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: '12px 16px',
            borderTop: '1px solid #f3f4f6',
            gap: '8px',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              fontFamily: 'HelveticaNowDisplay, sans-serif',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#e5e7eb';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
