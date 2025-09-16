import React, { useState } from 'react';
import { useEcho } from '../hooks/useEcho';
import { EchoSignInProps } from '../types';
import { sanitizeText } from '../utils/security';
import { Logo } from './Logo';

export function EchoSignIn({
  onSuccess,
  onError,
  className = '',
  children,
}: EchoSignInProps) {
  const { signIn, isLoading, isLoggedIn, user, error } = useEcho();
  const [isHovered, setIsHovered] = useState(false);

  React.useEffect(() => {
    if (user && onSuccess) {
      onSuccess(user);
    }
  }, [user, onSuccess]);

  React.useEffect(() => {
    if (error && onError) {
      onError(new Error(error));
    }
  }, [error, onError]);

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (err) {
      if (onError) {
        onError(err instanceof Error ? err : new Error('Sign in failed'));
      }
    }
  };

  if (user) {
    return (
      <div className={`echo-signin-success ${className}`}>
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
          <span>Signed in as {sanitizeText(user?.name || user?.email)}</span>
        </div>
      </div>
    );
  }

  if (isLoading && !user) {
    return (
      <div className={`echo-signin ${className}`}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            width: 'fit-content',
            minWidth: '100px',
            height: '44px',
          }}
        >
          <div
            style={{
              width: '16px',
              height: '16px',
              backgroundColor: '#e5e7eb',
              borderRadius: '4px',
            }}
          />
          <div
            style={{
              width: '60px',
              height: '12px',
              backgroundColor: '#e5e7eb',
              borderRadius: '4px',
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`echo-signin ${className}`}>
      {children ? (
        <div onClick={handleSignIn} style={{ cursor: 'pointer' }}>
          {children}
        </div>
      ) : (
        <button
          onClick={handleSignIn}
          disabled={isLoading}
          className="echo-signin-button"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            backgroundColor: isLoading
              ? '#f3f4f6'
              : isHovered
                ? '#f1f5f9'
                : '#ffffff',
            color: isLoading ? '#9ca3af' : '#09090b',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
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
          <span>Sign in</span>
        </button>
      )}
    </div>
  );
}
