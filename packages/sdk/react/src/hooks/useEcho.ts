import { useContext } from 'react';
import { EchoContext } from '../context';

export function useEcho() {
  const context = useContext(EchoContext);

  if (!context) {
    throw new Error('useEcho must be used within an EchoProvider');
  }

  return context;
}
