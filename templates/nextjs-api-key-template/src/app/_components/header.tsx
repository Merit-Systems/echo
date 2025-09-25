import { EchoAccount } from '@/components/echo-account-next';
import { isSignedIn } from '@/echo';
import type { FC } from 'react';

interface HeaderProps {
  title?: string;
  className?: string;
}

const Header: FC<HeaderProps> = async ({
  title = 'My App',
  className = '',
}) => {
  const signedIn = await isSignedIn();

  return (
    <header
      className={`border-gray-200 border-b bg-white shadow-sm ${className}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <h1 className="font-semibold text-gray-900 text-xl">{title}</h1>
          </div>

          <nav className="flex items-center space-x-4">
            <EchoAccount />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
