import { useState } from 'react';

interface UseJoinAppReturn {
  joining: boolean;
  showJoinModal: boolean;
  setShowJoinModal: (show: boolean) => void;
  handleJoinApp: (appId: string) => Promise<void>;
}

export function useJoinApp(): UseJoinAppReturn {
  const [joining, setJoining] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Function to handle joining the app as a customer
  const handleJoinApp = async (appId: string) => {
    setJoining(true);
    try {
      const response = await fetch(`/api/owner/apps/${appId}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}), // Empty body for self-enrollment
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to join app');
      }

      // Success - redirect to refresh the page and show customer view
      window.location.reload();
    } catch (error) {
      console.error('Error joining app:', error);
      throw error;
    } finally {
      setJoining(false);
    }
  };

  return {
    joining,
    showJoinModal,
    setShowJoinModal,
    handleJoinApp,
  };
}
