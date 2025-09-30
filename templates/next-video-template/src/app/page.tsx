/**
 * Next.js Video Generation Template with Echo SDK
 *
 * This template demonstrates how to build an AI video generation app using:
 * - Echo SDK for authentication and token management
 * - Google Veo models for video generation
 * - Next.js App Router for server-side rendering
 *
 * Key features:
 * 1. Authentication: Automatic login/logout with Echo SDK
 * 2. Video Generation: Support for Veo 3 Fast model
 * 3. Duration Control: Adjustable video length (1-60 seconds)
 * 4. History: Persistent video gallery with download/copy actions
 * 5. Responsive Design: Works on desktop and mobile
 *
 * Usage Examples:
 * - Text-to-Video: "A beautiful sunset over mountains with birds flying"
 * - Duration Control: Adjust slider for video length
 * - Model Selection: Currently supports Veo 3 Fast
 */

import { isSignedIn } from '@/echo';
import VideoGenerator from '@/components/video-generator';

import { EchoAccount } from '@/components/echo-account-next';

/**
 * Main application page
 *
 * Server component that checks authentication status and renders
 * either the sign-in page or the main video generation interface
 */
export default async function Home() {
  // Check authentication status using Echo SDK
  const _isSignedIn = await isSignedIn();

  // Main application interface
  return (
    <div className="flex flex-col h-screen p-2 sm:p-4 max-w-6xl mx-auto">
      {/* Header with title and token display */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full mb-4 sm:mb-8 p-4 sm:p-6 bg-gradient-to-r from-slate-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm gap-3 sm:gap-0">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl sm:text-3xl font-mono bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Echo Video Gen
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Echo token display widget */}
          {/* {_isSignedIn && <EchoWidget />} */}
          <EchoAccount />
        </div>
      </header>

      {/* Main video generation interface */}
      <div className="relative">
        <VideoGenerator />

        {/* Overlay when not signed in */}
        {!_isSignedIn && (
          <div className="absolute inset-0 backdrop-blur-[2px] bg-white/30 flex items-center justify-center rounded-xl border border-gray-300">
            <EchoAccount />
          </div>
        )}
      </div>
    </div>
  );
}
