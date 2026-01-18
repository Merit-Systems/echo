"use client";

import { Button } from "@/components/ui/button";
import { useEcho } from "@merit-systems/echo-next-sdk/client";
import { useState } from "react";
import { useAccount } from "wagmi";
import { AuthModal } from "./auth-modal";
import { WalletConnectButton } from "./connect-button";
import { EchoAccount } from "./echo-account-next";
import { Skeleton } from "./ui/skeleton";

export function ConnectionSelector() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { isConnected, isConnecting } = useAccount();
  const { user, isLoading } = useEcho();

  if (isLoading || isConnecting) {
    return <Skeleton className="h-10 w-24 animate-pulse" />;
  }

  // If either is already connected, show only that connection method
  const isEchoConnected = !!user;
  const isWalletConnected = isConnected;

  // If Echo is connected, only show Echo
  if (isEchoConnected) {
    return (
      <div className="flex items-center gap-3">
        <EchoAccount />
      </div>
    );
  }

  // If Wallet is connected, only show Wallet
  if (isWalletConnected) {
    return (
      <div className="flex items-center gap-3">
        <WalletConnectButton />
      </div>
    );
  }

  // If not connected, show login button
  return (
    <>
      <Button
        onClick={() => setAuthModalOpen(true)}
        variant="outline"
        size="lg"
        className="w-full sm:w-auto"
      >
        Login
      </Button>
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
}