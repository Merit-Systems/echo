'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRightIcon,
  CreditCardIcon,
  ShieldIcon,
  ZapIcon,
} from 'lucide-react';

export default function EchoSplashPage() {
  const [activeTab, setActiveTab] = useState<'developers' | 'customers'>(
    'developers'
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Hidden component to set the cookie */}

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-linear-to-r from-white via-blue-200 to-white bg-clip-text text-transparent pb-3">
              Welcome to Echo
            </h1>
            <p className="mt-6 text-xl md:text-2xl max-w-3xl mx-auto text-blue-100">
              The seamless platform connecting payment rails and authentication
              to your AI applications
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link
                href="/login"
                className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg transition-all duration-200 flex items-center gap-2 hover:gap-3"
              >
                Get Started <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <Link
                href="#features"
                className="px-8 py-3 rounded-lg bg-gray-800/50 hover:bg-gray-800/80 text-white border border-gray-700 font-medium text-lg transition-all duration-200"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-gray-900/50 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Everything You Need for AI Applications
            </h2>
            <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">
              Echo provides a complete platform for building, deploying, and
              monetizing AI applications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-800/50 backdrop-blur-xs border border-gray-700/50 rounded-xl p-6 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
              <div className="h-12 w-12 rounded-lg bg-blue-600/20 flex items-center justify-center mb-5">
                <ShieldIcon className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                OAuth Authentication
              </h3>
              <p className="text-gray-300">
                Secure user authentication with built-in OAuth flows. No
                callback routes needed - just configure and go.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-800/50 backdrop-blur-xs border border-gray-700/50 rounded-xl p-6 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
              <div className="h-12 w-12 rounded-lg bg-purple-600/20 flex items-center justify-center mb-5">
                <CreditCardIcon className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Payment Integration
              </h3>
              <p className="text-gray-300">
                Seamless token purchasing and balance management. Let users buy
                credits to use your AI applications.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-800/50 backdrop-blur-xs border border-gray-700/50 rounded-xl p-6 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
              <div className="h-12 w-12 rounded-lg bg-emerald-600/20 flex items-center justify-center mb-5">
                <ZapIcon className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                LLM Integration
              </h3>
              <p className="text-gray-300">
                Works with all OpenAI and Anthropic models. Easy integration
                with AI SDK and LangChain.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              How Echo Works
            </h2>
            <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">
              Choose your perspective to see how Echo can help you
            </p>

            {/* Tabs */}
            <div className="flex justify-center mt-8 space-x-4">
              <button
                onClick={() => setActiveTab('developers')}
                className={`px-6 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === 'developers'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
                }`}
              >
                For Developers
              </button>
              <button
                onClick={() => setActiveTab('customers')}
                className={`px-6 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === 'customers'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
                }`}
              >
                For Customers
              </button>
            </div>
          </div>

          {/* Developer Content */}
          <div className={`${activeTab === 'developers' ? 'block' : 'hidden'}`}>
            <div className="bg-gray-800/30 backdrop-blur-xs border border-gray-700/50 rounded-xl p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">
                    Build AI Apps with Echo
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="shrink-0 h-10 w-10 rounded-full bg-blue-600/20 flex items-center justify-center mr-4">
                        <span className="text-blue-400 font-bold">1</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">
                          Create Your Echo App
                        </h4>
                        <p className="mt-2 text-gray-300">
                          Sign up, create a new app in the owner dashboard, and
                          get your app ID.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="shrink-0 h-10 w-10 rounded-full bg-blue-600/20 flex items-center justify-center mr-4">
                        <span className="text-blue-400 font-bold">2</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">
                          Integrate the SDK
                        </h4>
                        <p className="mt-2 text-gray-300">
                          Install the Echo React SDK and configure the
                          EchoProvider with your app ID.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="shrink-0 h-10 w-10 rounded-full bg-blue-600/20 flex items-center justify-center mr-4">
                        <span className="text-blue-400 font-bold">3</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">
                          Connect LLM Services
                        </h4>
                        <p className="mt-2 text-gray-300">
                          Use Echo tokens with OpenAI or Anthropic models
                          through our router endpoint.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="shrink-0 h-10 w-10 rounded-full bg-blue-600/20 flex items-center justify-center mr-4">
                        <span className="text-blue-400 font-bold">4</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">
                          Monetize Your App
                        </h4>
                        <p className="mt-2 text-gray-300">
                          Let users purchase tokens to use your AI features.
                          Echo handles all the payment processing.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="lg:pl-10">
                  <div className="bg-gray-900 rounded-lg p-5 border border-gray-700">
                    <div className="flex items-center mb-4">
                      <div className="flex space-x-2">
                        <div className="h-3 w-3 rounded-full bg-red-500"></div>
                        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="ml-4 text-xs text-gray-400">App.tsx</div>
                    </div>
                    <pre className="text-sm text-blue-300 overflow-x-auto">
                      <code>{`import { EchoProvider } from '@merit-systems/echo-react-sdk';

const echoConfig = {
  appId: 'your-app-id',
  apiUrl: 'https://echo.merit.systems',
  redirectUri: window.location.origin,
};

function Root() {
  return (
    <EchoProvider config={echoConfig}>
      <App />
    </EchoProvider>
  );
}`}</code>
                    </pre>
                  </div>
                  <div className="mt-6">
                    <Link
                      href="/login"
                      className="inline-block w-full text-center px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200"
                    >
                      Start Building with Echo
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Content */}
          <div className={`${activeTab === 'customers' ? 'block' : 'hidden'}`}>
            <div className="bg-gray-800/30 backdrop-blur-xs border border-gray-700/50 rounded-xl p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">
                    Using Apps Built with Echo
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="shrink-0 h-10 w-10 rounded-full bg-purple-600/20 flex items-center justify-center mr-4">
                        <span className="text-purple-400 font-bold">1</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">
                          Sign In
                        </h4>
                        <p className="mt-2 text-gray-300">
                          Create an Echo account or sign in to access
                          applications built with Echo.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="shrink-0 h-10 w-10 rounded-full bg-purple-600/20 flex items-center justify-center mr-4">
                        <span className="text-purple-400 font-bold">2</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">
                          Purchase Tokens
                        </h4>
                        <p className="mt-2 text-gray-300">
                          Buy tokens to use with any Echo-powered application.
                          Tokens work across all apps.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="shrink-0 h-10 w-10 rounded-full bg-purple-600/20 flex items-center justify-center mr-4">
                        <span className="text-purple-400 font-bold">3</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">
                          Use AI Applications
                        </h4>
                        <p className="mt-2 text-gray-300">
                          Access all your Echo-enabled applications from one
                          place. Echo handles authentication and billing.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="shrink-0 h-10 w-10 rounded-full bg-purple-600/20 flex items-center justify-center mr-4">
                        <span className="text-purple-400 font-bold">4</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">
                          Track Usage
                        </h4>
                        <p className="mt-2 text-gray-300">
                          Monitor your token usage and transactions across all
                          Echo applications.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="lg:pl-10">
                  <div className="bg-gray-900 rounded-lg p-6 border border-gray-700 h-full flex flex-col justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4">
                        Benefits for Users
                      </h4>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <div className="shrink-0 h-5 w-5 text-emerald-400 mr-2">
                            ✓
                          </div>
                          <p className="text-gray-300">
                            Single sign-on for multiple AI applications
                          </p>
                        </li>
                        <li className="flex items-start">
                          <div className="shrink-0 h-5 w-5 text-emerald-400 mr-2">
                            ✓
                          </div>
                          <p className="text-gray-300">
                            Centralized token management and billing
                          </p>
                        </li>
                        <li className="flex items-start">
                          <div className="shrink-0 h-5 w-5 text-emerald-400 mr-2">
                            ✓
                          </div>
                          <p className="text-gray-300">
                            Access to cutting-edge AI models
                          </p>
                        </li>
                        <li className="flex items-start">
                          <div className="shrink-0 h-5 w-5 text-emerald-400 mr-2">
                            ✓
                          </div>
                          <p className="text-gray-300">
                            Secure authentication and data handling
                          </p>
                        </li>
                      </ul>
                    </div>
                    <div className="mt-6">
                      <Link
                        href="/login"
                        className="inline-block w-full text-center px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-all duration-200"
                      >
                        Access Your Echo Apps
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Continue to App Button */}
      <div className="py-10 text-center">
        <Link
          href="/"
          className="px-8 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-lg transition-all duration-200 inline-flex items-center gap-2 mx-auto hover:gap-3"
        >
          Continue to My Apps <ArrowRightIcon className="h-5 w-5" />
        </Link>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900/80 backdrop-blur-xs py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold text-white">Echo</h3>
              <p className="text-gray-400 mt-2">
                Seamless AI infrastructure for developers and users
              </p>
            </div>
            <div className="flex space-x-8">
              <Link href="/login" className="text-gray-300 hover:text-white">
                Sign In
              </Link>
              <a
                href="https://echo.merit.systems"
                className="text-gray-300 hover:text-white"
              >
                Documentation
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Echo. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
