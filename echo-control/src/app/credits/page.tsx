'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/balance';
import {
  useCreditGrantInvoicePaymentLink,
  usePaymentLink,
} from '@/hooks/usePaymentLink';
import { useUserBalance } from '@/hooks/useUserBalance';
import { useUserPayments } from '@/hooks/useUserPayments';

export default function CreditsPage() {
  const { user, isLoaded } = useUser();
  // const { createPaymentLink, loading: purchaseLoading } = usePaymentLink();
  const { createCreditGrantInvoice, loading: purchaseLoading } =
    useCreditGrantInvoicePaymentLink();
  const { balance, loading, fetchBalance } = useUserBalance();
  const {
    payments,
    loading: paymentsLoading,
    pagination,
    fetchPayments,
  } = useUserPayments();
  const [customAmount, setCustomAmount] = useState('');
  const [showCustomAmount, setShowCustomAmount] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      fetchBalance();
      fetchPayments();
    }
  }, [isLoaded, user, fetchBalance, fetchPayments]);

  const handleAddCredits = async () => {
    const amount = Number(customAmount);
    const result = await createCreditGrantInvoice({ amount });
    console.log(
      'Credit grant invoice payment link created:',
      result?.paymentLink
    );
    // open in a new tab
    window.open(result?.paymentLink, '_blank');
  };

  const handleDefaultCredits = async () => {
    const result = await createCreditGrantInvoice();
    console.log(
      'Credit grant invoice payment link created:',
      result?.paymentLink
    );
    // open in a new tab
    window.open(result?.paymentLink, '_blank');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-48"></div>
            <div className="space-y-6">
              <div className="h-32 bg-muted rounded-lg"></div>
              <div className="h-40 bg-muted rounded-lg"></div>
              <div className="h-32 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 hover:text-primary" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Credits
              </h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Row */}
          {/* Current Balance */}
          <Card className="h-80 flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Current Balance
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {formatCurrency(Number(balance?.balance) || 0)}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-3">
                  {!showCustomAmount ? (
                    <>
                      <Button
                        onClick={handleDefaultCredits}
                        disabled={purchaseLoading}
                        className="px-6 bg-primary hover:bg-primary/90"
                      >
                        {purchaseLoading ? 'Processing...' : 'Add $10 Credits'}
                      </Button>
                      <button
                        onClick={() => setShowCustomAmount(true)}
                        className="text-sm text-muted-foreground hover:text-foreground underline"
                      >
                        Choose different amount
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">$</span>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={customAmount}
                          onChange={e => setCustomAmount(e.target.value)}
                          className="w-24 text-right"
                          min="1"
                          step="0.01"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowCustomAmount(false);
                            setCustomAmount('');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAddCredits}
                          disabled={
                            purchaseLoading ||
                            !customAmount ||
                            Number(customAmount) <= 0
                          }
                          className="px-4 bg-primary hover:bg-primary/90"
                          size="sm"
                        >
                          {purchaseLoading ? 'Processing...' : 'Add Credits'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="h-80 flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              {paymentsLoading ? (
                <div className="text-center py-8 flex items-center justify-center h-full">
                  <div>
                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-muted-foreground mt-2">
                      Loading transactions...
                    </p>
                  </div>
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-8 flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No credits purchased</p>
                </div>
              ) : (
                <div className="space-y-4 h-full overflow-y-auto">
                  {payments.map(payment => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {payment.description || 'Echo Credits Purchase'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(payment.createdAt)}
                        </p>
                      </div>
                      <div className="text-right space-y-1 flex-shrink-0 ml-2">
                        <p className="font-semibold text-sm">
                          {formatCurrency(payment.amount)}
                        </p>
                        <p
                          className={`text-xs capitalize ${getStatusColor(payment.status)}`}
                        >
                          {payment.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center mt-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!pagination.hasPreviousPage}
                      onClick={() => fetchPayments(pagination.page - 1)}
                    >
                      Previous
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!pagination.hasNextPage}
                      onClick={() => fetchPayments(pagination.page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
