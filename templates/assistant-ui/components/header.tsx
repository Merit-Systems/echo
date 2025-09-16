'use client';

import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { signOut, echoClient } from '@merit-systems/echo-next-sdk/client';
import Image from 'next/image';
// Define the User type locally since it's not exported from the Next.js SDK
interface User {
  name?: string;
  email: string;
}
import { useBalance } from './balance-provider';

export const Header = () => {
  const { balance, loading: balanceLoading, refreshBalance } = useBalance();
  const [user, setUser] = useState<User | null>(null);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [paymentLinkLoading, setPaymentLinkLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);

  // Initial balance fetch
  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  // create a payment link
  useEffect(() => {
    const createPaymentLink = async () => {
      try {
        const paymentLinkResponse = await echoClient.payments.createPaymentLink(
          {
            amount: 1,
            description: 'Credits',
          }
        );
        setPaymentLink(paymentLinkResponse.paymentLink.url);
      } catch (error) {
        console.error('Failed to create payment link:', error);
      } finally {
        setPaymentLinkLoading(false);
      }
    };
    createPaymentLink();
  }, []);

  // get user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await echoClient.users.getUserInfo();
        setUser(user);
      } catch (error) {
        console.error('Failed to fetch user info:', error);
      } finally {
        setUserLoading(false);
      }
    };
    fetchUser();
  }, []);

  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-3">
        <Image
          src="/manifest/192x192.png"
          alt="Echo logo"
          width={32}
          height={32}
        />
        <span className="font-semibold">Echo Chat</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Balance and User Info */}
        <div className="flex items-center gap-4">
          {/* Balance Display */}
          {balanceLoading ? (
            <div className="text-sm text-muted-foreground">
              Balance: Loading...
            </div>
          ) : balance ? (
            <div className="text-sm">
              <span className="text-muted-foreground">Balance: </span>
              <span className="font-medium">${balance.balance.toFixed(2)}</span>
            </div>
          ) : null}

          {/* User Info */}
          {userLoading ? (
            <div className="text-sm text-muted-foreground">Loading user...</div>
          ) : user ? (
            <div className="text-sm">
              <span className="text-muted-foreground">Hello, </span>
              <span className="font-medium">{user.name || user.email}</span>
            </div>
          ) : null}

          {/* Add Credits Button - Always show, greyed out when loading */}
          <Button
            size="sm"
            variant="outline"
            disabled={paymentLinkLoading || !paymentLink}
            onClick={() => paymentLink && window.open(paymentLink, '_blank')}
          >
            {paymentLinkLoading ? 'Loading...' : 'Add Credits'}
          </Button>
        </div>

        <Button onClick={() => signOut()} size="sm">
          Sign out
        </Button>
      </div>
    </header>
  );
};
