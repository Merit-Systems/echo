'use client';

import { Check, Copy, Trash, Plus } from 'lucide-react';
import { GlassButton } from './glass-button';
import { useOAuthConfig } from '@/hooks/useOAuthConfig';

interface OAuthConfigSectionProps {
  appId: string;
}

export default function OAuthConfigSection({ appId }: OAuthConfigSectionProps) {
  const {
    config,
    loading,
    error,
    newUrl,
    adding,
    copiedField,
    setNewUrl,
    handleAddCallbackUrl,
    handleRemoveCallbackUrl,
    copyToClipboard,
  } = useOAuthConfig(appId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-20">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-secondary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2">
          OAuth Configuration
        </h4>
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-foreground">
        OAuth Configuration
      </h4>

      {/* Client ID */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Client ID
        </label>
        <div className="flex items-center gap-2">
          <code className="flex-1 px-3 py-2 bg-muted/30 rounded-lg text-xs font-mono text-foreground">
            {appId}
          </code>
          <button
            onClick={() => copyToClipboard(appId, 'client_id')}
            className="p-2 hover:bg-muted/50 rounded-lg transition-colors duration-200"
          >
            {copiedField === 'client_id' ? (
              <Check className="h-3 w-3 text-green-600" />
            ) : (
              <Copy className="h-3 w-3 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Callback URLs */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-muted-foreground">
          Callback URLs
        </label>

        {/* Add new URL */}
        <div className="flex gap-2">
          <input
            type="url"
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            placeholder="https://yourapp.com/callback"
            className="flex-1 px-3 py-2 border border-input/50 bg-input/30 rounded-lg text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary/50"
          />
          <GlassButton
            onClick={handleAddCallbackUrl}
            disabled={!newUrl.trim() || adding}
            variant="secondary"
          >
            <Plus className="h-3 w-3" />
          </GlassButton>
        </div>

        {/* List existing URLs */}
        {config && config.authorized_callback_urls.length > 0 ? (
          <div className="space-y-1">
            {config.authorized_callback_urls.map((url, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-muted/20 rounded-lg"
              >
                <code className="text-xs font-mono text-foreground break-all flex-1 mr-2">
                  {url}
                </code>
                <button
                  onClick={() => handleRemoveCallbackUrl(url)}
                  className="p-1 hover:bg-destructive/10 rounded transition-colors duration-200"
                >
                  <Trash className="h-3 w-3 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground py-2">
            No callback URLs configured
          </p>
        )}
      </div>
    </div>
  );
}
