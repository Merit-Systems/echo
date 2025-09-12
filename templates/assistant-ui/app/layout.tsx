import type { Metadata } from 'next';
import './globals.css';
import { isSignedIn } from '@/echo';
import SignInButton from '@/components/SignInButton';

export const metadata: Metadata = {
  title: 'AI SDK v5 Example',
  description: 'Example using @assistant-ui/react with AI SDK v5',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const signedIn = await isSignedIn();

  return (
    <html lang="en">
      <body className="h-dvh">
        {signedIn ? (
          children
        ) : (
          <div className="h-full flex items-center justify-center p-6">
            <div className="flex flex-col items-center gap-4">
              <h1 className="text-2xl font-semibold">
                Welcome to Echo + Assistant UI
              </h1>
              <p className="text-muted-foreground">
                Sign in to start chatting.
              </p>
              <SignInButton />
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
