import type { Meta, StoryObj } from '@storybook/react-vite';
import { EchoSignOut } from '../components/EchoSignOut';
import { MockEchoProvider, mockStates } from './MockEchoProvider';

const meta: Meta<typeof EchoSignOut> = {
  title: 'Echo SDK/EchoSignOut',
  component: EchoSignOut,
  parameters: {
    docs: {
      description: {
        component:
          'The EchoSignOut component provides a sign-out button for authenticated users. It handles the sign-out process and can be customized with your own UI.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <MockEchoProvider mockState={mockStates.authenticated}>
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
    onSuccess: () => console.log('Sign out successful'),
    onError: error => console.error('Sign out error:', error),
  },
};

export const WithCallbacks: Story = {
  args: {
    onSuccess: () => {
      console.log('✅ Sign out successful!');
      alert('You have been signed out successfully!');
    },
    onError: error => {
      console.error('❌ Sign out failed:', error);
      alert(`Sign out failed: ${error.message}`);
    },
  },
};

export const WithCustomButton: Story = {
  args: {
    onSuccess: () => console.log('Sign out successful'),
    onError: error => console.error('Sign out error:', error),
    children: (
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
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        🚪 Sign Out
      </button>
    ),
  },
};

export const MinimalStyle: Story = {
  args: {
    className: 'minimal-signout',
    onSuccess: () => console.log('Sign out successful'),
    onError: error => console.error('Sign out error:', error),
    children: (
      <button
        style={{
          padding: '6px 12px',
          background: 'transparent',
          color: '#dc2626',
          border: '1px solid #dc2626',
          borderRadius: '4px',
          fontSize: '12px',
          cursor: 'pointer',
          fontWeight: '500',
        }}
      >
        Sign out
      </button>
    ),
  },
};

export const SignedOutState: Story = {
  decorators: [
    Story => (
      <MockEchoProvider mockState={mockStates.unauthenticated}>
        <div style={{ padding: '20px' }}>
          <p style={{ marginBottom: '16px', color: '#666' }}>
            This shows how the component appears when the user is already signed
            out:
          </p>
          <Story />
        </div>
      </MockEchoProvider>
    ),
  ],
  args: {
    onSuccess: () => console.log('Sign out successful'),
    onError: error => console.error('Sign out error:', error),
  },
};
