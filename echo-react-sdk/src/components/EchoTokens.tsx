import { useEffect, useRef, useState } from 'react';
import { useEcho } from '../hooks/useEcho';
import { EchoTokensProps } from '../types';
import { openPaymentFlow } from '../utils/security';
import { EchoSignIn } from './EchoSignIn';
import { EchoSignOut } from './EchoSignOut';
import { Logo } from './Logo';

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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '8px',
      }}
    >
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
          placeholder="0.00"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          style={{
            width: '96px',
            textAlign: 'right',
            padding: '8px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'HelveticaNowDisplay, sans-serif',
            outline: 'none',
            backgroundColor: '#ffffff',
          }}
          min="1"
          step="0.01"
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={onCancel}
          style={{
            padding: '8px 12px',
            backgroundColor: 'transparent',
            color: '#6b7280',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer',
            fontFamily: 'HelveticaNowDisplay, sans-serif',
            textDecoration: 'none',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#111827';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = '#6b7280';
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleAddCredits}
          disabled={isProcessing || !isValidAmount}
          style={{
            padding: '8px 16px',
            backgroundColor:
              isProcessing || !isValidAmount ? '#9ca3af' : '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: isProcessing || !isValidAmount ? 'not-allowed' : 'pointer',
            fontFamily: 'HelveticaNowDisplay, sans-serif',
          }}
          onMouseEnter={e => {
            if (!isProcessing && isValidAmount) {
              e.currentTarget.style.backgroundColor = '#b91c1c';
            }
          }}
          onMouseLeave={e => {
            if (!isProcessing && isValidAmount) {
              e.currentTarget.style.backgroundColor = '#dc2626';
            }
          }}
        >
          {isProcessing ? 'Processing...' : 'Add Credits'}
        </button>
      </div>
    </div>
  );
};

export function EchoTokens({
  onPurchaseComplete,
  onError,
  className = '',
  children,
  showAvatar = false,
}: EchoTokensProps) {
  const {
    createPaymentLink,
    user,
    balance,
    freeTierBalance,
    refreshBalance,
    paymentRequired,
    clearPaymentRequired,
  } = useEcho();
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCustomAmount, setShowCustomAmount] = useState(false);

  // Automatically show modal when payment is required (402 error)
  useEffect(() => {
    if (paymentRequired && user) {
      setIsModalOpen(true);
    }
  }, [paymentRequired, user]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  // Calculate available spend: min(spendLimit, amount in pool) - amountSpent with floor of 0
  const calculateAvailableSpend = () => {
    const freeTierAmountLeft =
      (freeTierBalance?.userSpendInfo?.amountLeft || 0) < 0
        ? 0
        : freeTierBalance?.userSpendInfo?.amountLeft || 0;
    const balanceAmount = balance?.balance || 0;
    return freeTierAmountLeft + balanceAmount;
  };

  const handlePurchase = async (purchaseAmount: number) => {
    if (!user) {
      const error = new Error('Please sign in to purchase tokens');
      setPurchaseError(error.message);
      if (onError) onError(error);
      return;
    }

    try {
      setIsProcessing(true);
      setPurchaseError(null);

      const paymentUrl = await createPaymentLink(purchaseAmount);

      await openPaymentFlow(paymentUrl, {
        onComplete: async () => {
          try {
            await refreshBalance();
            setIsModalOpen(false);
            setShowCustomAmount(false);
            if (onPurchaseComplete && balance) {
              onPurchaseComplete(balance);
            }
          } catch (err) {
            const error =
              err instanceof Error
                ? err
                : new Error('Failed to refresh balance');
            setPurchaseError(error.message);
            if (onError) onError(error);
          } finally {
            setIsProcessing(false);
          }
        },
        onCancel: () => {
          setIsProcessing(false);
        },
        onError: err => {
          setPurchaseError(err.message);
          if (onError) onError(err);
          setIsProcessing(false);
        },
      });
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to create payment link');
      setPurchaseError(error.message);
      if (onError) onError(error);
      setIsProcessing(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setShowCustomAmount(false);
    setPurchaseError(null);
    // Clear payment required state when modal is closed
    if (paymentRequired) {
      clearPaymentRequired();
    }
  };

  if (!user) {
    return (
      <div className={`echo-token-purchase ${className}`}>
        {children ? (
          <div
            className="echo-token-purchase-unauthorized"
            style={{
              padding: '12px',
              backgroundColor: '#fef3c7',
              color: '#92400e',
              borderRadius: '8px',
              fontSize: '14px',
              textAlign: 'center',
            }}
          >
            <p style={{ margin: '0 0 12px 0' }}>
              Please sign in to purchase tokens
            </p>
            <EchoSignIn />
          </div>
        ) : (
          <EchoSignIn />
        )}
      </div>
    );
  }

  // Compact button that exactly matches BalanceCard compact version
  const CompactButton = () => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <button
        onClick={() => setIsModalOpen(true)}
        className={`echo-token-purchase-compact ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 12px',
          borderRadius: '8px',
          backgroundColor: isHovered ? '#f1f5f9' : '#ffffff',
          border: '1px solid #e5e7eb',
          color: '#09090b',
          fontSize: '14px',
          fontWeight: '800',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.2s ease',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          height: '40px',
          fontFamily: 'HelveticaNowDisplay, sans-serif',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Avatar or Logo */}
        {showAvatar && user?.picture ? (
          <img
            src={user.picture}
            alt={user.name || user.email || 'User avatar'}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              objectFit: 'cover',
              flexShrink: 0,
            }}
            onError={e => {
              // Fallback to logo if image fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <Logo width={20} height={20} variant="light" />
        )}
        <span>{formatCurrency(calculateAvailableSpend())}</span>
        {/* Arrow Up Right Icon - matching lucide-react ArrowUpRight */}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            color: isHovered ? '#dc2626' : '#6b7280',
            transition: 'color 0.2s ease',
          }}
        >
          <path d="M7 7h10v10" />
          <path d="M7 17 17 7" />
        </svg>
      </button>
    );
  };

  // Modal with credit purchase card design
  const Modal = () => {
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
        }}
        onClick={e => {
          if (e.target === e.currentTarget) {
            closeModal();
          }
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            padding: '0',
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
                Credits
              </h2>
            </div>

            {/* Payment Required Message */}
            {paymentRequired && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor: '#fef3c7',
                  color: '#92400e',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'HelveticaNowDisplay, sans-serif',
                  border: '1px solid #fbbf24',
                }}
              >
                <strong>Insufficient Credits:</strong>{' '}
                {paymentRequired.message || 'Please add credits to continue.'}
              </div>
            )}
          </div>

          {/* Current Balance Section */}
          <div style={{ padding: '0 16px', marginBottom: '16px' }}>
            <p
              style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '0 0 4px 0',
                fontFamily: 'HelveticaNowDisplay, sans-serif',
              }}
            >
              Total Available
            </p>
            <p
              style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#111827',
                margin: '0 0 12px 0',
                fontFamily: 'HelveticaNowDisplay, sans-serif',
              }}
            >
              {formatCurrency(calculateAvailableSpend())}
            </p>

            {/* Breakdown */}
            <div style={{ marginBottom: '8px' }}>
              {/* Free Tier Breakdown */}
              {freeTierBalance && calculateAvailableSpend() > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      fontFamily: 'HelveticaNowDisplay, sans-serif',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '4px',
                    }}
                  >
                    <div
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#3b82f6',
                      }}
                    ></div>
                    <span>
                      {formatCurrency(
                        freeTierBalance.userSpendInfo.amountLeft < 0
                          ? 0
                          : freeTierBalance.userSpendInfo.amountLeft
                      )}{' '}
                      Free Tier
                      {freeTierBalance.userSpendInfo &&
                        freeTierBalance.userSpendInfo.spendLimit && (
                          <span style={{ color: '#9ca3af', marginLeft: '8px' }}>
                            (
                            {formatCurrency(
                              freeTierBalance.userSpendInfo.amountSpent >
                                freeTierBalance.userSpendInfo.spendLimit
                                ? freeTierBalance.userSpendInfo.spendLimit
                                : freeTierBalance.userSpendInfo.amountSpent
                            )}{' '}
                            of{' '}
                            {formatCurrency(
                              freeTierBalance.userSpendInfo.spendLimit
                            )}{' '}
                            spent)
                          </span>
                        )}
                    </span>
                  </div>

                  {/* Usage Progress Bar */}
                  {freeTierBalance.userSpendInfo &&
                    freeTierBalance.userSpendInfo.spendLimit && (
                      <div
                        style={{
                          width: '100%',
                          height: '4px',
                          backgroundColor: '#e5e7eb',
                          borderRadius: '2px',
                          overflow: 'hidden',
                          marginBottom: '4px',
                          border: '1px solid #d1d5db',
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.max(0, Math.min(100, (Math.max(0, freeTierBalance.userSpendInfo.amountLeft) / (freeTierBalance.userSpendInfo.spendLimit || 1)) * 100))}%`,
                            height: '100%',
                            backgroundColor: '#3b82f6',
                          }}
                        />
                      </div>
                    )}
                </div>
              )}

              {/* Paid Credits Breakdown */}
              {balance && balance.balance > 0 && (
                <div
                  style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    fontFamily: 'HelveticaNowDisplay, sans-serif',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '4px',
                    }}
                  >
                    <div
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#dc2626',
                      }}
                    ></div>
                    <span>
                      {formatCurrency(balance.balance)} Paid Credits
                      {balance.totalPaid > 0 && (
                        <span style={{ color: '#9ca3af', marginLeft: '8px' }}>
                          ({formatCurrency(balance.totalSpent)} of{' '}
                          {formatCurrency(balance.totalPaid)} spent)
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Paid Credits Progress Bar */}
                  {balance.totalPaid > 0 && (
                    <div
                      style={{
                        width: '100%',
                        height: '4px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '2px',
                        overflow: 'hidden',
                        border: '1px solid #d1d5db',
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.max(0, Math.min(100, (balance.balance / balance.totalPaid) * 100))}%`,
                          height: '100%',
                          backgroundColor: '#dc2626',
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Add Credits Section */}
          <div
            style={{
              padding: '0 16px 16px 16px',
              borderTop: '1px solid #f3f4f6',
              paddingTop: '16px',
            }}
          >
            <p
              style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '0 0 12px 0',
                fontFamily: 'HelveticaNowDisplay, sans-serif',
              }}
            >
              Add Credits
            </p>

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
                  {isProcessing ? 'Processing...' : 'Add $10 Credits'}
                </button>
                <button
                  onClick={() => setShowCustomAmount(true)}
                  style={{
                    width: '100%',
                    padding: '8px 16px',
                    fontSize: '14px',
                    color: '#6b7280',
                    backgroundColor: 'transparent',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontFamily: 'HelveticaNowDisplay, sans-serif',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = '#111827';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = '#6b7280';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  Choose different amount
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
            <div
              style={{
                margin: '0 16px 12px 16px',
                padding: '8px 12px',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'HelveticaNowDisplay, sans-serif',
              }}
            >
              {purchaseError}
            </div>
          )}

          {/* Footer with Sign Out and Close buttons */}
          <div
            style={{
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid #f3f4f6',
            }}
          >
            {/* Sign Out Button */}
            <EchoSignOut
              onSuccess={() => {
                console.log('Signed out from credits modal');
                closeModal();
              }}
              onError={error => {
                console.error('Sign out error from credits modal:', error);
              }}
            >
              <button
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  color: '#dc2626',
                  border: '1px solid #dc2626',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontFamily: 'HelveticaNowDisplay, sans-serif',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#fef2f2';
                  e.currentTarget.style.borderColor = '#b91c1c';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = '#dc2626';
                }}
              >
                Sign Out
              </button>
            </EchoSignOut>

            {/* Close Button */}
            <button
              onClick={closeModal}
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
  };

  return (
    <>
      {children ? (
        <div
          onClick={() => setIsModalOpen(true)}
          style={{
            cursor: 'pointer',
          }}
        >
          {children}
        </div>
      ) : (
        <CompactButton />
      )}

      {isModalOpen && <Modal />}
    </>
  );
}
