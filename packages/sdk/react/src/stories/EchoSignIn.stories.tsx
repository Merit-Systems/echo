import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { EchoSignIn } from '../components/EchoSignIn';
import { MockEchoProvider, mockStates } from './MockEchoProvider';

const meta: Meta<typeof EchoSignIn> = {
  title: 'Echo SDK/EchoSignIn',
  component: EchoSignIn,
  parameters: {
    docs: {
      description: {
        component:
          'The EchoSignIn component provides a sign-in button for Echo authentication. It handles the OAuth2 + PKCE flow automatically and can be customized with your own UI.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <MockEchoProvider mockState={mockStates.unauthenticated}>
        <div style={{ padding: '20px' }}>
          <Story />
        </div>
      </MockEchoProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSuccess: user => console.log('Sign in success:', user),
    onError: error => console.error('Sign in error:', error),
  },
};

export const WithCustomClassName: Story = {
  args: {
    className: 'my-custom-signin',
    onSuccess: user => console.log('Sign in success:', user),
    onError: error => console.error('Sign in error:', error),
  },
};

export const WithCustomButton: Story = {
  args: {
    onSuccess: user => console.log('Sign in success:', user),
    onError: error => console.error('Sign in error:', error),
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
          transition: 'transform 0.2s',
        }}
      >
        🚀 Join Echo Now!
      </button>
    ),
  },
};

export const MinimalStyle: Story = {
  args: {
    onSuccess: user => console.log('Sign in success:', user),
    onError: error => console.error('Sign in error:', error),
    children: (
      <button
        style={{
          padding: '8px 16px',
          background: 'transparent',
          color: '#666',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '14px',
          cursor: 'pointer',
        }}
      >
        Sign in
      </button>
    ),
  },
};

export const WithCallbacks: Story = {
  args: {
    onSuccess: user => {
      console.log('✅ Sign in successful!', user);
      alert(`Welcome ${user.name || user.email}!`);
    },
    onError: error => {
      console.error('❌ Sign in failed:', error);
      alert(`Sign in failed: ${error.message}`);
    },
  },
};
