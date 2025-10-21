import Chat from '@/app/_components/chat';
import { AuthGuard } from '@/components/wallet';
import { isSignedIn } from '@/echo';

export default async function Home() {
  const signedIn = await isSignedIn();

  return (
    <AuthGuard isEchoSignedIn={signedIn}>
      <Chat />
    </AuthGuard>
  );
}
