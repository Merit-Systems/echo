import { isSignedIn } from '@/echo';
import Link from 'next/link';
import BalanceWidget from '../BalanceWidget';
import SignInButton from '../SignInButton';

export default async function NavBar() {
  const signedIn = await isSignedIn();
  return (
    <nav className="w-full border-b py-3">
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link href="/" className="font-semibold">
          Merit Echo
        </Link>
        <div className="flex items-center gap-3">
          {signedIn ? <BalanceWidget /> : <SignInButton />}
        </div>
      </div>
    </nav>
  );
}
