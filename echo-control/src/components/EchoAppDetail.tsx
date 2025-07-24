'use client';

import { useEffect, useState } from 'react';
import ApiKeyModal from './ApiKeyModal';
import CreateApiKeyModal from './CreateApiKeyModal';
import { AppRole, Permission } from '@/lib/permissions/types';
import { useEchoAppDetail } from '@/hooks/useEchoAppDetail';
import { PublicAppDetail } from './app-detail/PublicAppDetail';
import { CustomerAppDetail } from './app-detail/CustomerAppDetail';
import { OwnerAppDetail } from './app-detail/OwnerAppDetail';
import { CustomerEchoApp, OwnerEchoApp } from '@/lib/echo-apps';

interface EchoAppDetailProps {
  appId: string;
}

export default function EchoAppDetail({ appId }: EchoAppDetailProps) {
  const { app, loading, error, userPermissions, refetch, hasPermission } =
    useEchoAppDetail(appId);

  const [showCreateApiKeyModal, setShowCreateApiKeyModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [newApiKey, setNewApiKey] = useState<{
    id: string;
    key: string;
    name: string;
  } | null>(null);
  const [deletingKeyId, setDeletingKeyId] = useState<string | null>(null);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  useEffect(() => {
    // Check for payment success in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success') {
      setShowPaymentSuccess(true);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleCreateApiKey = async (data: {
    name: string;
    echoAppId: string;
  }) => {
    try {
      const response = await fetch(`/api/api-keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create API key');
      }

      // Store the new API key for display in the modal
      setNewApiKey({
        id: result.apiKey.id,
        key: result.apiKey.key,
        name: result.apiKey.name,
      });

      // Close the create modal and show the key display modal
      setShowCreateApiKeyModal(false);
      setShowApiKeyModal(true);

      // Refresh app details to show the new key in the list
      await refetch();
    } catch (error) {
      console.error('Error creating API key:', error);
      throw error;
    }
  };

  const handleRenameApiKey = async (id: string, newName: string) => {
    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to rename API key');
      }

      await refetch(); // Refresh data
    } catch (error) {
      console.error('Error renaming API key:', error);
      throw error;
    }
  };

  const handleArchiveApiKey = async (id: string) => {
    setDeletingKeyId(id);
    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to archive API key');
      }

      await refetch(); // Refresh data
    } catch (error) {
      console.error('Error archiving API key:', error);
    } finally {
      setDeletingKeyId(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
      </div>
    );
  }

  // Error state
  if (error || !app) {
    return (
      <div className="text-center py-12 fade-in">
        <h2 className="text-xl font-semibold text-foreground">App not found</h2>
        <p className="mt-2 text-muted-foreground">{error}</p>
      </div>
    );
  }

  // Route to the correct component based on user permissions
  const renderAppDetail = () => {
    // Public view for unauthenticated users or public role
    if (
      !userPermissions.isAuthenticated ||
      userPermissions.userRole === AppRole.PUBLIC
    ) {
      return <PublicAppDetail app={app} />;
    }

    // Customer view for customers with limited access
    if (userPermissions.userRole === AppRole.CUSTOMER) {
      return (
        <CustomerAppDetail
          app={app as CustomerEchoApp}
          hasPermission={hasPermission}
          onCreateApiKey={() => setShowCreateApiKeyModal(true)}
          onArchiveApiKey={handleArchiveApiKey}
          deletingKeyId={deletingKeyId}
          showPaymentSuccess={showPaymentSuccess}
          onDismissPaymentSuccess={() => setShowPaymentSuccess(false)}
        />
      );
    }

    // Owner/Admin view with full access
    return (
      <OwnerAppDetail
        app={app as OwnerEchoApp}
        hasPermission={hasPermission}
        onCreateApiKey={() => setShowCreateApiKeyModal(true)}
        onArchiveApiKey={handleArchiveApiKey}
        deletingKeyId={deletingKeyId}
        showPaymentSuccess={showPaymentSuccess}
        onDismissPaymentSuccess={() => setShowPaymentSuccess(false)}
      />
    );
  };

  return (
    <>
      {renderAppDetail()}

      {/* Modals */}
      <div className="relative z-50">
        {showCreateApiKeyModal &&
          app &&
          (hasPermission(Permission.CREATE_API_KEYS) ||
            hasPermission(Permission.MANAGE_OWN_API_KEYS)) && (
            <CreateApiKeyModal
              echoAppId={app.id}
              onClose={() => setShowCreateApiKeyModal(false)}
              onSubmit={handleCreateApiKey}
            />
          )}

        {showApiKeyModal && newApiKey && (
          <ApiKeyModal
            apiKey={newApiKey}
            onClose={() => {
              setShowApiKeyModal(false);
              setNewApiKey(null);
            }}
            onRename={handleRenameApiKey}
          />
        )}
      </div>
    </>
  );
}
