'use client';

import { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { UserIcon, LogOutIcon, Settings, Home } from 'lucide-react';
import MarketplaceView from './MarketplaceView';

interface MarketplaceApp {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  markup: number;
  memberCount: number;
  transactionCount: number;
  userMembership: {
    id: string;
    role: string;
    status: string;
  } | null;
}

export default function MarketplacePage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [apps, setApps] = useState<MarketplaceApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      fetchApps();
    }
  }, [isLoaded, user]);

  const fetchApps = async () => {
    try {
      setError(null);
      const response = await fetch('/api/marketplace');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch marketplace apps');
      }

      setApps(data.apps || []);
    } catch (error) {
      console.error('Error fetching marketplace apps:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to fetch marketplace apps'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with User Menu */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
          </h1>
          <p className="text-muted-foreground">
            Discover new applications and expand your AI toolkit.
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

      {/* Marketplace View */}
      <MarketplaceView apps={apps} onRefresh={fetchApps} />
    </div>
  );
}
