import {
  EchoProvider,
  EchoSignIn,
  EchoTokens,
  useEcho,
} from '@merit-systems/echo-react-sdk';
import { ImageGeneration } from './components/ImageGeneration';

function Dashboard() {
  const { user, balance, error, isLoading } = useEcho();

  // Show loading state
  if (!user && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-gray-700">
            Processing authentication...
          </h1>
          <p className="text-gray-500">
            Please wait while we complete the OAuth flow.
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Authentication Error
          </h1>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Not signed in - show sign in button
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">
            Welcome to Echo
          </h1>
          <EchoSignIn />
        </div>
      </div>
    );
  }

  // Signed in but no balance - show token purchase
  if (balance?.balance === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Hi {user?.name}!
          </h1>
          <p className="text-gray-600 mb-6">You need tokens to get started.</p>
          <EchoTokens amount={100} />
        </div>
      </div>
    );
  }

  // Main dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-800">
                Image Generator
              </h1>
            </div>

            {/* User info */}
            <div className="flex items-center space-x-4">
              <EchoTokens amount={100} />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}

        {/* Tab content */}
        <div className="bg-white rounded-lg shadow-sm p-6 min-h-[600px]">
          <ImageGeneration />
        </div>

        {/* Low balance warning */}
        {balance && balance.balance < 5 && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Low Balance Warning
                </h3>
                <p className="text-sm text-yellow-700">
                  You have ${balance.balance.toFixed(2)} remaining. Consider
                  adding more credits.
                </p>
              </div>
              <EchoTokens amount={100} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  const baseEchoUrl =
    import.meta.env.VITE_ECHO_URL || 'https://echo.merit.systems';
  const baseRouterUrl =
    import.meta.env.VITE_ROUTER_URL || 'https://echo.router.merit.systems';
  const appId =
    import.meta.env.VITE_ECHO_APP_ID || '46e0ce04-641d-4238-93c9-2482668de9bc';

  return (
    <EchoProvider
      config={{
        appId,
        baseEchoUrl,
        baseRouterUrl,
        redirectUri: window.location.origin,
        scope: 'llm:invoke offline_access',
      }}
    >
      <Dashboard />
    </EchoProvider>
  );
}

export default App;
