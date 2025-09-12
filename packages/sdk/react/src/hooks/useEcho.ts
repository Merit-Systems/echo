import { useContext } from 'react';
import { EchoContext, EchoRefreshContext } from '../components/EchoProvider';

export function useEcho() {
  const context = useContext(EchoContext);

  if (!context) {
    throw new Error('useEcho must be used within an EchoProvider');
  }

  return context;
}

// Internal hook for refresh state - not exposed in public API
export function useEchoRefresh() {
  const context = useContext(EchoRefreshContext);

  if (!context) {
    throw new Error('useEchoRefresh must be used within an EchoProvider');
  }

  return context;
}
