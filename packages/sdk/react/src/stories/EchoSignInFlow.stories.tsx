import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { EchoSignIn } from '../components/EchoSignIn';
import { MockEchoProvider, mockStates } from './MockEchoProvider';
import { useEcho } from '../hooks/useEcho';

const meta: Meta<typeof EchoSignIn> = {
  title: 'Echo SDK/EchoSignIn States',
  component: EchoSignIn,
  parameters: {
    docs: {
      description: {
        component:
          'This story shows the EchoSignIn component in different authentication states using the oidc-client-ts implementation.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Simple demo component to show auth state
function AuthStatusDemo() {
  const { user, isLoggedIn, isLoading, error, balance } = useEcho();

  return (
    <div
      style={{
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        marginBottom: '20px',
        backgroundColor: '#f9f9f9',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h3>Current Auth State</h3>
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}
      >
        <div>
          <strong>Authenticated:</strong> {isLoggedIn ? '✅ Yes' : '❌ No'}
        </div>
        <div>
          <strong>Loading:</strong> {isLoading ? '🔄 Yes' : '✅ No'}
        </div>
        <div>
          <strong>User:</strong>{' '}
          {user ? `${user.name} (${user.email})` : 'None'}
        </div>
        <div>
          <strong>Balance:</strong>{' '}
          {balance
            ? `${balance.totalPaid} ${balance.totalSpent} ${balance.balance}`
            : 'None'}
        </div>
      </div>
      {error && (
        <div
          style={{
            marginTop: '10px',
            padding: '10px',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            borderRadius: '4px',
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}

export const Unauthenticated: Story = {
  decorators: [
    Story => (
      <MockEchoProvider mockState={mockStates.unauthenticated}>
        <div style={{ padding: '20px' }}>
          <AuthStatusDemo />
          <h3>Sign In Button (Unauthenticated)</h3>
          <p>Shows the sign-in button when user is not authenticated:</p>
          <Story />
        </div>
      </MockEchoProvider>
    ),
  ],
  args: {
    onSuccess: user => console.log('✅ Sign in success:', user),
    onError: error => console.error('❌ Sign in error:', error),
  },
};

export const Loading: Story = {
  decorators: [
    Story => (
      <MockEchoProvider mockState={mockStates.loading}>
        <div style={{ padding: '20px' }}>
          <AuthStatusDemo />
          <h3>Sign In Button (Loading)</h3>
          <p>Shows the button in loading state:</p>
          <Story />
        </div>
      </MockEchoProvider>
    ),
  ],
  args: {
    onSuccess: user => console.log('✅ Sign in success:', user),
    onError: error => console.error('❌ Sign in error:', error),
  },
};

export const Authenticated: Story = {
  decorators: [
    Story => (
      <MockEchoProvider mockState={mockStates.authenticated}>
        <div style={{ padding: '20px' }}>
          <AuthStatusDemo />
          <h3>Sign In Button (Already Authenticated)</h3>
          <p>Shows welcome message when user is already signed in:</p>
          <Story />
        </div>
      </MockEchoProvider>
    ),
  ],
  args: {
    onSuccess: user => console.log('✅ Sign in success:', user),
    onError: error => console.error('❌ Sign in error:', error),
  },
};

export const WithError: Story = {
  decorators: [
    Story => (
      <MockEchoProvider mockState={mockStates.error}>
        <div style={{ padding: '20px' }}>
          <AuthStatusDemo />
          <h3>Sign In Button (With Error)</h3>
          <p>Shows error state:</p>
          <Story />
        </div>
      </MockEchoProvider>
    ),
  ],
  args: {
    onSuccess: user => console.log('✅ Sign in success:', user),
    onError: error => console.error('❌ Sign in error:', error),
  },
};

export const CustomButton: Story = {
  decorators: [
    Story => (
      <MockEchoProvider mockState={mockStates.unauthenticated}>
        <div style={{ padding: '20px' }}>
          <AuthStatusDemo />
          <h3>Custom Styled Button</h3>
          <p>Same oidc-client-ts functionality with custom styling:</p>
          <Story />
        </div>
      </MockEchoProvider>
    ),
  ],
  args: {
    onSuccess: user => console.log('✅ Custom sign in success:', user),
    onError: error => console.error('❌ Custom sign in error:', error),
    children: (
      <button
        style={{
          padding: '16px 32px',
          background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        }}
      >
        🚀 Join Echo Now!
      </button>
    ),
  },
};
