import type { Meta, StoryObj } from '@storybook/react-vite';
import { EchoTokens } from '../components/EchoTokens';
import { MockEchoProvider, mockStates } from './MockEchoProvider';

const meta: Meta<typeof EchoTokens> = {
  title: 'Echo SDK/EchoTokens',
  component: EchoTokens,
  parameters: {
    docs: {
      description: {
        component:
          "The EchoTokens component allows users to purchase tokens through Stripe. It opens a payment popup and automatically refreshes the user's balance after successful payment.",
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <MockEchoProvider mockState={mockStates.authenticated}>
        <div style={{ padding: '20px', minHeight: '100px', height: '100px' }}>
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
    amount: 100,
    onPurchaseComplete: balance => console.log('Purchase complete:', balance),
    onError: error => console.error('Purchase error:', error),
  },
};

export const Small: Story = {
  args: {
    amount: 50,
    onPurchaseComplete: balance => console.log('Purchase complete:', balance),
    onError: error => console.error('Purchase error:', error),
  },
};

export const Large: Story = {
  args: {
    amount: 500,
    onPurchaseComplete: balance => console.log('Purchase complete:', balance),
    onError: error => console.error('Purchase error:', error),
  },
};

export const WithCustomButton: Story = {
  args: {
    amount: 250,
    onPurchaseComplete: balance => console.log('Purchase complete:', balance),
    onError: error => console.error('Purchase error:', error),
    children: (
      <button
        style={{
          padding: '16px 32px',
          background: 'linear-gradient(45deg, #4facfe, #00f2fe)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        💎 Buy $25 Credits
      </button>
    ),
  },
};

export const MinimalStyle: Story = {
  args: {
    amount: 100,
    className: 'minimal-purchase',
    onPurchaseComplete: balance => console.log('Purchase complete:', balance),
    onError: error => console.error('Purchase error:', error),
    children: (
      <button
        style={{
          padding: '8px 16px',
          background: 'transparent',
          color: '#1f9ae0',
          border: '1px solid #1f9ae0',
          borderRadius: '4px',
          fontSize: '14px',
          cursor: 'pointer',
        }}
      >
        Buy tokens
      </button>
    ),
  },
};

export const WithCallbacks: Story = {
  args: {
    amount: 200,
    onPurchaseComplete: balance => {
      console.log('✅ Purchase successful!', balance);
      alert(
        `Purchase complete! New balance: ${balance.totalPaid} ${balance.totalSpent} ${balance.balance}`
      );
    },
    onError: error => {
      console.error('❌ Purchase failed:', error);
      alert(`Purchase failed: ${error.message}`);
    },
  },
};

export const ZeroFreeTierWithRealBalance: Story = {
  decorators: [
    Story => (
      <MockEchoProvider
        mockState={{
          isAuthenticated: true,
          user: mockStates.authenticated.user,
          balance: { totalPaid: 2.5, totalSpent: 0.5, balance: 2.0 },
          freeTierBalance: {
            spendPoolBalance: 0,
            userSpendInfo: {
              userId: 'mock-user-123',
              echoAppId: 'mock-app-123',
              spendPoolId: 'mock-spend-pool-123',
              amountSpent: 1,
              spendLimit: 1,
              amountLeft: 0,
            },
          },
          isLoading: false,
        }}
      >
        <div style={{ padding: '20px', minHeight: '100px', height: '100px' }}>
          <div
            style={{
              marginBottom: '16px',
              padding: '12px',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
            }}
          >
            <p
              style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#333' }}
            >
              User State: Free tier exhausted, but has paid balance
            </p>
            <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
              Free tier balance: $0.00 | Paid balance: $2.00
            </p>
          </div>
          <Story />
        </div>
      </MockEchoProvider>
    ),
  ],
  args: {
    amount: 100,
    onPurchaseComplete: balance => console.log('Purchase complete:', balance),
    onError: error => console.error('Purchase error:', error),
  },
};

export const FreeTierOnly: Story = {
  decorators: [
    Story => (
      <MockEchoProvider mockState={mockStates.freeTierOnly}>
        <div style={{ padding: '20px', minHeight: '100px', height: '100px' }}>
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
              User State: Free tier only (no paid balance)
            </p>
            <p style={{ margin: '0', color: '#0284c7', fontSize: '14px' }}>
              Free tier balance: $25.00 remaining of $50.00 | Paid balance:
              $0.00
            </p>
          </div>
          <Story />
        </div>
      </MockEchoProvider>
    ),
  ],
  args: {
    amount: 100,
    onPurchaseComplete: balance => console.log('Purchase complete:', balance),
    onError: error => console.error('Purchase error:', error),
  },
};

export const WithAvatar: Story = {
  args: {
    amount: 100,
    showAvatar: true,
    onPurchaseComplete: balance => console.log('Purchase complete:', balance),
    onError: error => console.error('Purchase error:', error),
  },
};

export const AvatarComparison: Story = {
  decorators: [
    () => (
      <MockEchoProvider mockState={mockStates.authenticated}>
        <div style={{ padding: '20px', minHeight: '100px', height: '100px' }}>
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
              Avatar Feature Demo
            </p>
            <p style={{ margin: '0', color: '#0284c7', fontSize: '14px' }}>
              Compare buttons with and without user avatar display
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '16px',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <p
                style={{
                  margin: '0 0 8px 0',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                Default (Logo):
              </p>
              <EchoTokens
                amount={100}
                showAvatar={false}
                onPurchaseComplete={balance =>
                  console.log('Purchase complete:', balance)
                }
                onError={error => console.error('Purchase error:', error)}
              />
            </div>

            <div>
              <p
                style={{
                  margin: '0 0 8px 0',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                With Avatar:
              </p>
              <EchoTokens
                amount={100}
                showAvatar={true}
                onPurchaseComplete={balance =>
                  console.log('Purchase complete:', balance)
                }
                onError={error => console.error('Purchase error:', error)}
              />
            </div>
          </div>
        </div>
      </MockEchoProvider>
    ),
  ],
  args: {},
};

export const UnauthenticatedState: Story = {
  decorators: [
    Story => (
      <MockEchoProvider mockState={mockStates.unauthenticated}>
        <div style={{ padding: '20px', minHeight: '600px', height: '100vh' }}>
          <p style={{ marginBottom: '16px', color: '#666' }}>
            This shows how the component appears when the user is not signed in:
          </p>
          <Story />
        </div>
      </MockEchoProvider>
    ),
  ],
  args: {
    amount: 100,
  },
};
