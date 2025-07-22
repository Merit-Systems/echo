'use client';

import { useEffect, useState, useCallback } from 'react';

interface OAuthConfig {
  client_id: string;
  name: string;
  description: string;
  is_active: boolean;
  authorized_callback_urls: string[];
  oauth_endpoints: {
    authorization_url: string;
    token_url: string;
    refresh_url: string;
  };
}

interface UseOAuthConfigResult {
  config: OAuthConfig | null;
  loading: boolean;
  error: string | null;
  newUrl: string;
  adding: boolean;
  copiedField: string | null;
  setNewUrl: (url: string) => void;
  handleAddCallbackUrl: () => Promise<void>;
  handleRemoveCallbackUrl: (url: string) => Promise<void>;
  copyToClipboard: (text: string, field: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useOAuthConfig = (appId: string): UseOAuthConfigResult => {
  const [config, setConfig] = useState<OAuthConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState('');
  const [adding, setAdding] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchOAuthConfig = useCallback(async () => {
    try {
      const response = await fetch(`/api/apps/${appId}/oauth-config`);
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      } else if (response.status === 404) {
        // App exists but no OAuth config yet - that's fine
        setConfig(null);
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to load OAuth configuration');
      }
    } catch {
      setError('Failed to load OAuth configuration');
    } finally {
      setLoading(false);
    }
  }, [appId]);

  useEffect(() => {
    fetchOAuthConfig();
  }, [appId, fetchOAuthConfig]);

  const handleAddCallbackUrl = async () => {
    if (!newUrl.trim()) return;

    setAdding(true);
    try {
      const response = await fetch(`/api/apps/${appId}/oauth-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_url: newUrl.trim() }),
      });

      if (response.ok) {
        setNewUrl('');
        await fetchOAuthConfig(); // Refresh config
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add callback URL');
      }
    } catch {
      alert('Failed to add callback URL');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveCallbackUrl = async (url: string) => {
    try {
      const response = await fetch(`/api/apps/${appId}/oauth-config`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_url: url }),
      });

      if (response.ok) {
        await fetchOAuthConfig(); // Refresh config
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to remove callback URL');
      }
    } catch {
      alert('Failed to remove callback URL');
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return {
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
    refetch: fetchOAuthConfig,
  };
};
