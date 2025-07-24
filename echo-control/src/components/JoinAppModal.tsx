'use client';

import { useState } from 'react';
import { X, Key } from 'lucide-react';
import { GlassButton } from './glass-button';
import { ProfileAvatar } from './ui/profile-avatar';
import { PublicEchoApp } from '@/lib/echo-apps/types';

interface JoinAppModalProps {
  app: PublicEchoApp;
  onClose: () => void;
  onSubmit: () => Promise<void>;
}

export default function JoinAppModal({
  app,
  onClose,
  onSubmit,
}: JoinAppModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    setLoading(true);
    setError(null);

    try {
      await onSubmit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join app');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/75 backdrop-blur-sm overflow-y-auto h-full w-full z-50 fade-in">
      <div className="relative top-20 mx-auto p-6 border border-border w-[500px] shadow-lg rounded-md bg-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-card-foreground">
            Join {app.name}
          </h3>
          <button onClick={onClose} className="!h-8 !w-8">
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-destructive/20 border border-destructive rounded-md p-3">
            <div className="text-sm text-destructive-foreground">{error}</div>
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-start gap-3 mb-2">
              <ProfileAvatar
                src={app.profilePictureUrl}
                alt={app.name}
                name={app.name}
              />
              <div className="flex flex-col">
                <h4 className="font-medium text-foreground">{app.name}</h4>
                <p className="text-sm text-muted-foreground">
                  by {app.owner.name || app.owner.email}
                </p>
              </div>
            </div>
            {app.description && (
              <p className="text-sm text-muted-foreground mt-2">
                {app.description}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-foreground">
              As a customer, you will be able to:
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Key className="h-4 w-4 text-primary" />
                <span className="text-sm text-foreground">
                  Create and manage API keys to use the app&apos;s services
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-md hover:bg-accent text-foreground"
          >
            Cancel
          </button>
          <GlassButton
            onClick={handleJoin}
            disabled={loading}
            variant="primary"
          >
            {loading ? 'Joining...' : 'Join App'}
          </GlassButton>
        </div>
      </div>
    </div>
  );
}
