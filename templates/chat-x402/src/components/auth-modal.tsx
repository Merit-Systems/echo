'use client';

import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useEcho } from '@merit-systems/echo-next-sdk/client';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const { isConnected } = useAccount();
  const { user, signIn, isLoading } = useEcho();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const isEchoConnected = !!user;
  const isWalletConnected = isConnected;

  useEffect(() => {
    if ((isEchoConnected || isWalletConnected) && open) {
      onOpenChange(false);
    }
  }, [isEchoConnected, isWalletConnected, open, onOpenChange]);

  if (isEchoConnected || isWalletConnected) {
    return null;
  }

  const handleEchoConnect = () => {
    setIsSigningIn(true);
    signIn();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Connect to Chat</DialogTitle>
          <DialogDescription>Choose how to connect</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <Button
            onClick={handleEchoConnect}
            disabled={isLoading || isSigningIn}
            variant="outline"
            size="lg"
            className="w-full"
          >
            <Logo className="mr-2 h-4 w-4" />
            {isSigningIn ? 'Connecting...' : 'Connect with Echo'}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <Button
                onClick={() => {
                  onOpenChange(false);
                  openConnectModal();
                }}
                variant="outline"
                size="lg"
                className="w-full"
              >
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </Button>
            )}
          </ConnectButton.Custom>
        </div>
      </DialogContent>
    </Dialog>
  );
}
