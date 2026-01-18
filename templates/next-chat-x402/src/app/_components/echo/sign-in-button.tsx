'use client';

import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/auth-modal';
import { useState } from 'react';

export default function SignInButton() {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setAuthModalOpen(true)}
        className="group relative flex w-full justify-center rounded-lg border border-transparent bg-primary px-4 py-3 font-medium text-sm text-white transition-colors duration-200 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Sign in 
      </Button>
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
}
