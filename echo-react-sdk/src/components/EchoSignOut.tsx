import React, { useState } from 'react';
import { useEcho } from '../hooks/useEcho';
import { EchoSignOutProps } from '../types';
import { Logo } from './Logo';

export function EchoSignOut({
  onSuccess,
  onError,
  className = '',
  children,
}: EchoSignOutProps) {
  const { signOut, isLoading, user, error } = useEcho();
  const [isHovered, setIsHovered] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  React.useEffect(() => {
    if (!user && onSuccess && isSigningOut) {
      onSuccess();
      setIsSigningOut(false);
    }
  }, [user, onSuccess, isSigningOut]);

  React.useEffect(() => {
    if (error && onError) {
      onError(new Error(error));
    }
  }, [error, onError]);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
    } catch (err) {
      setIsSigningOut(false);
      if (onError) {
        onError(err instanceof Error ? err : new Error('Sign out failed'));
      }
    }
  };

  if (!user) {
    return (
      <div className={`echo-signout-success ${className}`}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            color: '#334155',
            fontSize: '14px',
            fontFamily: 'HelveticaNowDisplay, sans-serif',
            fontWeight: '800',
            width: 'fit-content',
          }}
        >
          <Logo width={16} height={16} variant="light" />
          <span>Signed out</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`echo-signout ${className}`}>
      {children ? (
        <div onClick={handleSignOut} style={{ cursor: 'pointer' }}>
          {children}
        </div>
      ) : (
        <button
          onClick={handleSignOut}
          disabled={isLoading || isSigningOut}
          className="echo-signout-button"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            backgroundColor:
              isLoading || isSigningOut
                ? '#f3f4f6'
                : isHovered
                  ? '#fef2f2'
                  : '#ffffff',
            color:
              isLoading || isSigningOut
                ? '#9ca3af'
                : isHovered
                  ? '#dc2626'
                  : '#374151',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            cursor: isLoading || isSigningOut ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '800',
            fontFamily: 'HelveticaNowDisplay, sans-serif',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            backdropFilter: 'blur(8px)',
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Logo width={16} height={16} variant="light" />
          <span>
            {isLoading || isSigningOut ? 'Signing out...' : `Sign out`}
          </span>
        </button>
      )}
    </div>
  );
}
