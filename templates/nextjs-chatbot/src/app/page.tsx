import Chat from '@/app/_components/chat';
import SignInButton from '@/app/_components/echo/sign-in-button';
import { isSignedIn } from '@/echo';

export default async function Home() {
  const signedIn = await isSignedIn();

  if (!signedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br p-4 dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-md space-y-8 text-center">
          <div>
            <h2 className="mt-6 font-bold text-3xl text-gray-900 tracking-tight dark:text-white">
              Echo Demo App
            </h2>
            <p className="mt-2 text-gray-600 text-sm dark:text-gray-400">
              AI-powered chat with built-in billing and user management
            </p>
          </div>

          <div className="space-y-4">
            <SignInButton />

            <div className="text-gray-500 text-xs dark:text-gray-400">
              Secure authentication with built-in AI billing
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <Chat />;
}
