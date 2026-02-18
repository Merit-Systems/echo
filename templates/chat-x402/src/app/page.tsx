'use client';

import Chat from '@/app/_components/chat';
import { AuthGuard } from '@/app/_components/auth-guard';

export default function Home() {
  return (
    <AuthGuard>
      <Chat />
    </AuthGuard>
  );
}
