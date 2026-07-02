'use client';

import ChatBotDemo from '@/app/_components/chat';
import { AuthGuard } from '@/components/auth-guard';

export default function Home() {
  return (
    <AuthGuard>
      <ChatBotDemo />
    </AuthGuard>
  );
}
