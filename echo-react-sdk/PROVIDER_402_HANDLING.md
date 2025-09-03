# Provider-Based 402 Payment Required Handling

The Echo React SDK now automatically handles 402 Payment Required responses through the EchoProvider context. This approach centralizes error handling and provides a clean, integrated solution.

## How It Works

The EchoProvider automatically:

1. **Intercepts all fetch requests** using a global fetch interceptor
2. **Detects 402 responses** from any HTTP request (LLM calls, API calls, etc.)
3. **Updates context state** with payment required information
4. **Triggers EchoTokens modal** automatically when insufficient credits are detected

## Implementation Details

### EchoProvider Context

The EchoProvider now includes payment required state in its context:

```typescript
interface PaymentRequiredInfo {
  message: string; // Error message from the server
  endpoint?: string; // The API endpoint that returned 402
  context?: string; // Additional context (e.g., "LLM request")
  timestamp: number; // When the error occurred
}

interface EchoContextValue {
  // ... existing properties
  paymentRequired: PaymentRequiredInfo | null;
  clearPaymentRequired: () => void;
}
```

### Automatic Modal Display

The EchoTokens component automatically:

- Watches the `paymentRequired` state from context
- Opens the payment modal when a 402 error occurs
- Shows the specific error message in the modal
- Clears the error state when the modal is closed

## Usage

### Basic Setup (No Code Changes Required)

Simply include the EchoTokens component in your app - it will automatically handle 402 errors:

```tsx
import { EchoProvider, EchoTokens } from '@merit-systems/echo-react-sdk';

function App() {
  return (
    <EchoProvider config={{ appId: 'your-app-id' }}>
      <YourLLMComponents />

      {/* This component automatically handles 402 errors */}
      <EchoTokens />
    </EchoProvider>
  );
}
```

### Using with OpenAI SDK

```tsx
import {
  EchoProvider,
  EchoTokens,
  useEchoOpenAI,
} from '@merit-systems/echo-react-sdk';

function ChatApp() {
  return (
    <EchoProvider config={{ appId: 'your-app-id' }}>
      <ChatInterface />
      <EchoTokens /> {/* Automatically handles 402 from OpenAI requests */}
    </EchoProvider>
  );
}

function ChatInterface() {
  const { openai, isReady } = useEchoOpenAI();

  const sendMessage = async (message: string) => {
    if (!openai || !isReady) return;

    try {
      // If this returns 402, EchoTokens modal will show automatically
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }],
      });

      console.log(response.choices[0].message.content);
    } catch (error) {
      // Handle other errors (402s are handled automatically)
      if (error.status !== 402) {
        console.error('Request failed:', error);
      }
    }
  };

  // ... rest of component
}
```

### Custom Payment Required Handling

Access the payment required state directly from context:

```tsx
import { useEcho } from '@merit-systems/echo-react-sdk';

function CustomComponent() {
  const { paymentRequired, clearPaymentRequired } = useEcho();

  useEffect(() => {
    if (paymentRequired) {
      console.log('Payment required:', paymentRequired.message);
      console.log('Endpoint:', paymentRequired.endpoint);
      console.log('Timestamp:', new Date(paymentRequired.timestamp));

      // Custom handling logic here

      // Clear the error when done
      clearPaymentRequired();
    }
  }, [paymentRequired, clearPaymentRequired]);

  return (
    <div>
      {paymentRequired && (
        <div className="payment-required-banner">
          Payment Required: {paymentRequired.message}
        </div>
      )}
    </div>
  );
}
```

### Preventing EchoTokens Auto-Modal

If you want to handle 402 errors manually and prevent EchoTokens from auto-opening:

```tsx
import { useEcho } from '@merit-systems/echo-react-sdk';

function MyCustomHandler() {
  const { paymentRequired, clearPaymentRequired } = useEcho();

  useEffect(() => {
    if (paymentRequired) {
      // Handle manually
      handlePaymentRequired(paymentRequired);

      // Clear immediately to prevent EchoTokens from opening
      clearPaymentRequired();
    }
  }, [paymentRequired, clearPaymentRequired]);

  // Don't include EchoTokens component, or it will still auto-open
  return <div>My custom payment handling</div>;
}
```

## User Experience

When a 402 error occurs, users will see:

1. **Immediate feedback** - Modal opens automatically without page refresh
2. **Clear error message** - Shows the specific error from the server
3. **Current balance display** - Users can see their remaining credits
4. **Quick top-up options** - Add credits immediately to continue
5. **Automatic balance refresh** - Balance updates after the 402 error

## Technical Benefits

### Centralized Error Handling

- All 402 errors are handled in one place (EchoProvider)
- Consistent behavior across all LLM requests
- No need to add error handling to individual components

### Context-Based State Management

- Payment required state is available throughout the component tree
- Reactive updates when 402 errors occur
- Clean separation of concerns

### Automatic Detection

- Works with any HTTP client (fetch, OpenAI SDK, Anthropic SDK, axios)
- No code changes required in existing LLM request handling
- Intercepts responses at the network level

### Performance Optimized

- Single global fetch interceptor (no duplicates)
- Context updates only trigger relevant re-renders
- Efficient state management with React's built-in context

## Migration from Event-Based Approach

If you were previously using the event-based approach:

```tsx
// ❌ Old event-based approach (no longer needed)
import {
  paymentRequiredEmitter,
  setupPaymentRequiredInterceptor,
} from '@merit-systems/echo-react-sdk';

useEffect(() => {
  setupPaymentRequiredInterceptor();
  paymentRequiredEmitter.on(handlePaymentRequired);
  return () => paymentRequiredEmitter.off(handlePaymentRequired);
}, []);

// ✅ New provider-based approach (automatic)
import { EchoProvider, EchoTokens } from '@merit-systems/echo-react-sdk';

function App() {
  return (
    <EchoProvider config={{ appId: 'your-app-id' }}>
      <YourComponents />
      <EchoTokens /> {/* That's it! */}
    </EchoProvider>
  );
}
```

## Error Flow

1. **LLM Request Made** - User makes request via OpenAI SDK, direct fetch, etc.
2. **402 Response Received** - Server responds with 402 Payment Required
3. **Provider Intercepts** - EchoProvider's fetch interceptor catches the response
4. **Context Updated** - `paymentRequired` state is set with error details
5. **EchoTokens Reacts** - Component sees context change and opens modal
6. **User Adds Credits** - User can immediately add credits from modal
7. **State Cleared** - `paymentRequired` is cleared when modal closes

This approach provides a seamless, automatic solution for handling insufficient credits across your entire application.
