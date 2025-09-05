import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { EchoSignOut } from '../components/EchoSignOut';
import { MockEchoProvider, mockStates } from './MockEchoProvider';

const meta: Meta<typeof EchoSignOut> = {
  title: 'Echo SDK/EchoSignOut Flow States',
  component: EchoSignOut,
  parameters: {
    docs: {
      description: {
        component:
          'This demonstrates the EchoSignOut component in different authentication states and flow scenarios.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Component to demonstrate state transitions
function SignOutStateDemo() {
  const [currentState, setCurrentState] = useState<
    'authenticated' | 'loading' | 'unauthenticated'
  >('authenticated');
  const [message, setMessage] = useState('');

  const handleStateChange = (
    newState: 'authenticated' | 'loading' | 'unauthenticated'
  ) => {
    setCurrentState(newState);
    setMessage('');
  };

  const handleSignOutSuccess = () => {
    setMessage('✅ Successfully signed out!');
    setTimeout(() => {
      setCurrentState('unauthenticated');
    }, 1500);
  };

  const handleSignOutError = (error: Error) => {
    setMessage(`❌ Sign out failed: ${error.message}`);
    setTimeout(() => {
      setCurrentState('authenticated');
    }, 2000);
  };

  const getMockState = () => {
    switch (currentState) {
      case 'authenticated':
        return mockStates.authenticated;
      case 'loading':
        return { ...mockStates.authenticated, isLoading: true };
      case 'unauthenticated':
        return mockStates.unauthenticated;
      default:
        return mockStates.authenticated;
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#374151' }}>
          Sign Out Flow Demo
        </h3>

        {/* State Controls */}
        <div style={{ marginBottom: '16px' }}>
          <p
            style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}
          >
            Current State: <strong>{currentState}</strong>
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleStateChange('authenticated')}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                backgroundColor:
                  currentState === 'authenticated' ? '#3b82f6' : '#f3f4f6',
                color: currentState === 'authenticated' ? 'white' : '#374151',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Authenticated
            </button>
            <button
              onClick={() => handleStateChange('loading')}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                backgroundColor:
                  currentState === 'loading' ? '#3b82f6' : '#f3f4f6',
                color: currentState === 'loading' ? 'white' : '#374151',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Loading
            </button>
            <button
              onClick={() => handleStateChange('unauthenticated')}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                backgroundColor:
                  currentState === 'unauthenticated' ? '#3b82f6' : '#f3f4f6',
                color: currentState === 'unauthenticated' ? 'white' : '#374151',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Unauthenticated
            </button>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div
            style={{
              padding: '12px',
              backgroundColor: message.includes('✅') ? '#f0fdf4' : '#fef2f2',
              color: message.includes('✅') ? '#166534' : '#dc2626',
              borderRadius: '8px',
              fontSize: '14px',
              marginBottom: '16px',
              border: `1px solid ${message.includes('✅') ? '#bbf7d0' : '#fecaca'}`,
            }}
          >
            {message}
          </div>
        )}

        {/* Component Demo */}
        <div
          style={{
            padding: '20px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
          }}
        >
          <MockEchoProvider mockState={getMockState()}>
            <EchoSignOut
              onSuccess={handleSignOutSuccess}
              onError={handleSignOutError}
            />
          </MockEchoProvider>
        </div>

        {/* State Description */}
        <div style={{ marginTop: '16px', fontSize: '14px', color: '#6b7280' }}>
          {currentState === 'authenticated' && (
            <p>
              <strong>Authenticated:</strong> User is signed in. Click the sign
              out button to initiate the sign out process.
            </p>
          )}
          {currentState === 'loading' && (
            <p>
              <strong>Loading:</strong> System is processing. The sign out
              button is disabled during loading states.
            </p>
          )}
          {currentState === 'unauthenticated' && (
            <p>
              <strong>Unauthenticated:</strong> User is signed out. The
              component shows a "Signed out" status message.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export const InteractiveFlowDemo: Story = {
  render: () => <SignOutStateDemo />,
};

export const AuthenticatedState: Story = {
  decorators: [
    Story => (
      <MockEchoProvider mockState={mockStates.authenticated}>
        <div style={{ padding: '20px' }}>
          <div
            style={{
              marginBottom: '16px',
              padding: '12px',
              backgroundColor: '#f0f9ff',
              borderRadius: '8px',
            }}
          >
            <p
              style={{
                margin: '0 0 8px 0',
                fontWeight: 'bold',
                color: '#0369a1',
              }}
            >
              State: User is authenticated
            </p>
            <p style={{ margin: '0', color: '#0284c7', fontSize: '14px' }}>
              User: demo@echo-systems.com | Status: Signed in
            </p>
          </div>
          <Story />
        </div>
      </MockEchoProvider>
    ),
  ],
  args: {
    onSuccess: () => console.log('✅ Sign out successful'),
    onError: error => console.error('❌ Sign out error:', error),
  },
};

export const LoadingState: Story = {
  decorators: [
    Story => (
      <MockEchoProvider
        mockState={{ ...mockStates.authenticated, isLoading: true }}
      >
        <div style={{ padding: '20px' }}>
          <div
            style={{
              marginBottom: '16px',
              padding: '12px',
              backgroundColor: '#fef3c7',
              borderRadius: '8px',
            }}
          >
            <p
              style={{
                margin: '0 0 8px 0',
                fontWeight: 'bold',
                color: '#92400e',
              }}
            >
              State: Loading/Processing
            </p>
            <p style={{ margin: '0', color: '#b45309', fontSize: '14px' }}>
              System is processing a request. Sign out button is disabled.
            </p>
          </div>
          <Story />
        </div>
      </MockEchoProvider>
    ),
  ],
  args: {
    onSuccess: () => console.log('✅ Sign out successful'),
    onError: error => console.error('❌ Sign out error:', error),
  },
};

export const UnauthenticatedState: Story = {
  decorators: [
    Story => (
      <MockEchoProvider mockState={mockStates.unauthenticated}>
        <div style={{ padding: '20px' }}>
          <div
            style={{
              marginBottom: '16px',
              padding: '12px',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
            }}
          >
            <p
              style={{
                margin: '0 0 8px 0',
                fontWeight: 'bold',
                color: '#374151',
              }}
            >
              State: User is not authenticated
            </p>
            <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>
              No user is signed in. Component shows "Signed out" status.
            </p>
          </div>
          <Story />
        </div>
      </MockEchoProvider>
    ),
  ],
  args: {
    onSuccess: () => console.log('✅ Sign out successful'),
    onError: error => console.error('❌ Sign out error:', error),
  },
};

export const ErrorState: Story = {
  decorators: [
    Story => (
      <MockEchoProvider mockState={mockStates.error}>
        <div style={{ padding: '20px' }}>
          <div
            style={{
              marginBottom: '16px',
              padding: '12px',
              backgroundColor: '#fef2f2',
              borderRadius: '8px',
            }}
          >
            <p
              style={{
                margin: '0 0 8px 0',
                fontWeight: 'bold',
                color: '#dc2626',
              }}
            >
              State: Error condition
            </p>
            <p style={{ margin: '0', color: '#b91c1c', fontSize: '14px' }}>
              System error: "Failed to connect to Echo server"
            </p>
          </div>
          <Story />
        </div>
      </MockEchoProvider>
    ),
  ],
  args: {
    onSuccess: () => console.log('✅ Sign out successful'),
    onError: error => console.error('❌ Sign out error:', error),
  },
};

export const WithCustomButtonStates: Story = {
  decorators: [
    () => (
      <div style={{ padding: '20px' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#374151' }}>
          Custom Button in Different States
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Authenticated */}
          <div>
            <h4
              style={{
                margin: '0 0 8px 0',
                fontSize: '16px',
                color: '#374151',
              }}
            >
              Authenticated
            </h4>
            <MockEchoProvider mockState={mockStates.authenticated}>
              <EchoSignOut
                onSuccess={() => console.log('Custom button sign out')}
                onError={error => console.error('Custom button error:', error)}
              >
                <button
                  style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(45deg, #ef4444, #dc2626)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                  }}
                >
                  🚪 Custom Sign Out
                </button>
              </EchoSignOut>
            </MockEchoProvider>
          </div>

          {/* Loading */}
          <div>
            <h4
              style={{
                margin: '0 0 8px 0',
                fontSize: '16px',
                color: '#374151',
              }}
            >
              Loading State
            </h4>
            <MockEchoProvider
              mockState={{ ...mockStates.authenticated, isLoading: true }}
            >
              <EchoSignOut
                onSuccess={() => console.log('Custom button sign out')}
                onError={error => console.error('Custom button error:', error)}
              >
                <button
                  style={{
                    padding: '8px 16px',
                    background: '#9ca3af',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'not-allowed',
                    opacity: 0.7,
                  }}
                >
                  ⏳ Processing...
                </button>
              </EchoSignOut>
            </MockEchoProvider>
          </div>

          {/* Unauthenticated */}
          <div>
            <h4
              style={{
                margin: '0 0 8px 0',
                fontSize: '16px',
                color: '#374151',
              }}
            >
              Already Signed Out
            </h4>
            <MockEchoProvider mockState={mockStates.unauthenticated}>
              <EchoSignOut
                onSuccess={() => console.log('Custom button sign out')}
                onError={error => console.error('Custom button error:', error)}
              >
                <button
                  style={{
                    padding: '8px 16px',
                    background: '#f3f4f6',
                    color: '#6b7280',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'default',
                  }}
                >
                  ✓ Already Signed Out
                </button>
              </EchoSignOut>
            </MockEchoProvider>
          </div>
        </div>
      </div>
    ),
  ],
  args: {},
};
