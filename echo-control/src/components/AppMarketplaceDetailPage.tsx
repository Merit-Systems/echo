'use client';

import { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { UserIcon, LogOutIcon, Settings, Home, Store } from 'lucide-react';
import AppMarketplaceDetail from './AppMarketplaceDetail';

interface DetailedApp {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  markup: number;
  githubId?: string;
  githubType?: string;
  memberCount: number;
  transactionCount: number;
  apiKeyCount: number;
  recentTransactions: number;
  totalRevenue: number;
  userMembership: {
    id: string;
    role: string;
    status: string;
    totalSpent: number;
    createdAt: string;
  } | null;
  owner: {
    name: string;
    email: string;
  } | null;
}

interface AppMarketplaceDetailPageProps {
  appId: string;
}

export default function AppMarketplaceDetailPage({
  appId,
}: AppMarketplaceDetailPageProps) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [app, setApp] = useState<DetailedApp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      fetchAppDetails();
    }
  }, [isLoaded, user, appId]);

  const fetchAppDetails = async () => {
    try {
      setError(null);
      const response = await fetch(`/api/marketplace/apps/${appId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch app details');
      }

      setApp(data.app);
    } catch (error) {
      console.error('Error fetching app details:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to fetch app details'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleJoinApp = async (appId: string) => {
    setIsJoining(true);
    try {
      setError(null);
      const response = await fetch('/api/marketplace/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join app');
      }

      // Show success message
      setJoinSuccess(data.message || 'Successfully joined the app!');
      setTimeout(() => setJoinSuccess(null), 5000);

      // Refresh the app details to update join status
      await fetchAppDetails();
    } catch (error) {
      console.error('Error joining app:', error);
      setError(error instanceof Error ? error.message : 'Failed to join app');
    } finally {
      setIsJoining(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-destructive/20 border border-destructive rounded-md p-4 max-w-md mx-auto">
          <div className="text-sm text-destructive-foreground">{error}</div>
          <div className="mt-4">
            <Link
              href="/marketplace"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-md hover:bg-primary/20 transition-colors"
            >
              Back to Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">App not found</div>
        <div className="mt-4">
          <Link
            href="/marketplace"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-md hover:bg-primary/20 transition-colors"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with User Menu */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">App Details</h1>
          <p className="text-muted-foreground">
            Learn more about this application before joining.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Navigation Links */}
          <Link
            href="/"
            className="flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-accent"
          >
            <Home className="h-4 w-4" />
            <span>My Apps</span>
          </Link>

          <Link
            href="/marketplace"
            className="flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-accent"
          >
            <Store className="h-4 w-4" />
            <span>Marketplace</span>
          </Link>

          <Link
            href="/owner"
            className="flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-accent"
          >
            <Settings className="h-4 w-4" />
            <span>Owner Dashboard</span>
          </Link>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg border border-border hover:bg-accent"
            >
              {user?.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <UserIcon className="h-8 w-8 text-muted-foreground" />
              )}
              <span className="text-sm font-medium text-foreground">
                {user?.fullName || user?.emailAddresses[0]?.emailAddress}
              </span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg z-10">
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent rounded-md"
                >
                  <LogOutIcon className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Message */}
      {joinSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-md p-4">
          <div className="flex items-center">
            <div className="text-sm text-emerald-700">✅ {joinSuccess}</div>
            <button
              onClick={() => setJoinSuccess(null)}
              className="ml-auto text-emerald-500 hover:text-emerald-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/20 border border-destructive rounded-md p-4">
          <div className="flex items-center">
            <div className="text-sm text-destructive-foreground">{error}</div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-destructive hover:text-destructive/70"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* App Detail View */}
      <AppMarketplaceDetail
        app={app}
        onJoinApp={handleJoinApp}
        isJoining={isJoining}
      />
    </div>
  );
}
