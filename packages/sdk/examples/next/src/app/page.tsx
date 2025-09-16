import { getUser, isSignedIn } from '@/echo';
import SignIn from './components/signin';
import TabsContainer from './components/tabs-container';
import { EchoWidget } from './components/echo-tokens';
import UserDropdown from './components/user-dropdown';
import BalanceDropdown from './components/balance-dropdown';

export default async function Home() {
  const _isSignedIn = await isSignedIn();
  const user = await getUser();
  const firstName =
    (user?.name && user.name.split(' ')[0]) ||
    (user?.email ? user.email.split('@')[0] : null);

  if (!_isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <SignIn />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-4 max-w-6xl mx-auto">
      <header className="flex justify-between items-center w-full mb-8 p-6 bg-gradient-to-r from-slate-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <h1 className="text-3xl font-mono bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Next.js SDK Example
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <EchoWidget />
          <BalanceDropdown />
          <UserDropdown
            firstName={firstName}
            email={user?.email ?? null}
            id={user?.id ?? null}
            name={user?.name ?? null}
          />
        </div>
      </header>

      {/* Balance moved to header dropdown */}
      <div className="w-full">
        <TabsContainer />
      </div>
    </div>
  );
}
