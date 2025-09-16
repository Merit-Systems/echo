import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { MockEchoProvider, mockStates } from './MockEchoProvider';
import { useEcho } from '../hooks/useEcho';

const meta: Meta<typeof MockEchoProvider> = {
  title: 'Echo SDK/EchoProvider',
  component: MockEchoProvider,
  parameters: {
    docs: {
      description: {
        component:
          'The EchoProvider component wraps your application and provides Echo authentication context to all child components. This is required for all other Echo components to function properly.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Demo component to show provider functionality
function ProviderDemo() {
  const { user, isLoggedIn, isLoading, error, balance } = useEcho();

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h3>Echo Provider Status</h3>
      <div
        style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}
      >
        <p>
          <strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}
        </p>
        <p>
          <strong>Authenticated:</strong> {isLoggedIn ? 'Yes' : 'No'}
        </p>
        <p>
          <strong>User:</strong> {user ? `${user.name || user.email}` : 'None'}
        </p>
        <p>
          <strong>Balance:</strong>{' '}
          {balance
            ? `${balance.totalPaid} ${balance.totalSpent} ${balance.balance}`
            : 'None'}
        </p>
        <p>
          <strong>Error:</strong> {error || 'None'}
        </p>
      </div>
    </div>
  );
}

export const Authenticated: Story = {
  args: {
    mockState: mockStates.authenticated,
    children: <ProviderDemo />,
  },
};

export const Unauthenticated: Story = {
  args: {
    mockState: mockStates.unauthenticated,
    children: <ProviderDemo />,
  },
};

export const Loading: Story = {
  args: {
    mockState: mockStates.loading,
    children: <ProviderDemo />,
  },
};

export const Error: Story = {
  args: {
    mockState: mockStates.error,
    children: <ProviderDemo />,
  },
};

export const LowBalance: Story = {
  args: {
    mockState: mockStates.lowBalance,
    children: <ProviderDemo />,
  },
};
