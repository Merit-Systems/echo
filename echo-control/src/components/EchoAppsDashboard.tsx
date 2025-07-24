'use client';

import CreateEchoAppModal from '@/components/CreateEchoAppModal';
import { useClerk, useUser } from '@clerk/nextjs';
import {
  ChartBarIcon,
  KeyIcon,
  LogOutIcon,
  PlusIcon,
  TrashIcon,
  UserIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { GlassButton } from './glass-button';
import { useEchoAppsDashboard } from '@/hooks/useEchoAppsDashboard';

export default function EchoAppsDashboard() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const {
    echoApps,
    loading,
    error,
    deletingAppId,
    handleCreateApp: createApp,
    handleArchiveApp: archiveApp,
  } = useEchoAppsDashboard();

  const handleCreateApp = async (appData: {
    name: string;
    description?: string;
    githubType?: 'user' | 'repo';
    githubId?: string;
  }) => {
    await createApp(appData);
    setShowCreateModal(false);
  };

  const handleArchiveApp = async (id: string, event: React.MouseEvent) => {
    event.preventDefault(); // Prevent navigation to app detail page
    event.stopPropagation(); // Stop event propagation

    await archiveApp(id);
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
      {/* Header with User Menu and Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
          </h1>
          <p className="text-muted-foreground">
            Manage your Echo applications and monitor usage.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <GlassButton
            onClick={() => setShowCreateModal(true)}
            variant="secondary"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Echo App
          </GlassButton>

          <div className="relative">
            <GlassButton
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2"
              variant="secondary"
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
            </GlassButton>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg z-10">
                <GlassButton
                  onClick={() => signOut()}
                  className="w-full flex items-center !h-10"
                  variant="secondary"
                >
                  <LogOutIcon className="h-4 w-4 mr-2" />
                  Sign Out
                </GlassButton>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/20 border border-destructive rounded-md p-4">
          <div className="text-sm text-destructive-foreground">{error}</div>
        </div>
      )}
      {/* Echo Apps Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Your Echo Apps
          </h2>
          <span className="text-sm text-muted-foreground">
            {echoApps.length} apps
          </span>
        </div>

        {echoApps.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <ChartBarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-card-foreground">
              No Echo apps
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by creating your first Echo application.
            </p>
            <div className="mt-6">
              <GlassButton
                onClick={() => setShowCreateModal(true)}
                variant="secondary"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Echo App
              </GlassButton>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {echoApps.map(app => (
              <Link
                key={app.id}
                href={`/apps/${app.id}`}
                className="block bg-card rounded-lg border border-border hover:border-secondary group"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-card-foreground truncate group-hover:text-secondary">
                      {app.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <GlassButton
                        onClick={() => {
                          const syntheticEvent = {
                            preventDefault: () => {},
                            stopPropagation: () => {},
                          } as React.MouseEvent;
                          handleArchiveApp(app.id, syntheticEvent);
                        }}
                        className={`!h-8 !w-8 rounded-full group-hover:opacity-100 ${
                          deletingAppId === app.id ? 'opacity-50' : 'opacity-0'
                        }`}
                        disabled={deletingAppId === app.id}
                        variant="primary"
                      >
                        <TrashIcon className="h-4 w-4 text-destructive" />
                      </GlassButton>
                    </div>
                  </div>

                  {app.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {app.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center text-muted-foreground">
                        <KeyIcon className="h-4 w-4 mr-1" />
                        API Keys
                      </div>
                      <div className="font-semibold text-card-foreground">
                        {app.stats.globalApiKeys.length}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center text-muted-foreground">
                        <ChartBarIcon className="h-4 w-4 mr-1" />
                        Transactions
                      </div>
                      <div className="font-semibold text-card-foreground">
                        {app.stats.globalTotalTransactions.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        Total Revenue:
                      </span>
                      <span className="font-semibold text-card-foreground">
                        ${Number(app.stats.globalTotalRevenue).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-1">
                      <span className="text-muted-foreground">
                        Total Tokens:
                      </span>
                      <span className="font-semibold text-card-foreground">
                        {app.stats.globalTotalTokens.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Created {new Date(app.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateEchoAppModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateApp}
        />
      )}
    </div>
  );
}
