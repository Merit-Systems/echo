# Echo AI Demo App

This is a demonstration Next.js application showcasing the power and simplicity of [Echo](https://echo.merit.systems) - a platform that provides AI billing, user management, and authentication for AI applications.

## 🚀 What is Echo?

Echo is a comprehensive platform that handles the complex infrastructure needed for AI applications, including:

- **AI Billing & Usage Tracking** - Automatic cost tracking and billing for AI API calls
- **User Authentication** - Secure sign-in and session management
- **Balance Management** - Real-time balance tracking and top-ups
- **Multi-Model Support** - Seamless integration with OpenAI, Anthropic, and other AI providers

## 📋 Demo Features

This demo application demonstrates:

- ✅ **AI Chat Interface** - Interactive chat with GPT-4o and GPT-5 nano models
- ✅ **Echo Authentication** - Secure user sign-in with Echo accounts
- ✅ **Real-time Balance Display** - Live balance tracking in the header
- ✅ **Automatic Billing** - AI usage automatically tracked and billed through Echo
- ✅ **Modern UI Components** - Beautiful, responsive interface with Tailwind CSS
- ✅ **Streaming Responses** - Real-time AI response streaming with reasoning display

## 🏗️ Architecture Overview

### Application Structure

```
src/
├── app/
│   ├── _components/
│   │   ├── chat.tsx              # Main chat interface component
│   │   ├── echo/
│   │   │   ├── balance.tsx       # Real-time balance display
│   │   │   └── sign-in-button.tsx # Echo authentication button
│   │   └── header.tsx            # App header with auth state
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts          # Chat API endpoint using Echo OpenAI
│   │   └── echo/
│   │       └── [...echo]/
│   │           └── route.ts      # Echo webhook handlers
│   ├── layout.tsx                # Root layout with Echo integration
│   └── page.tsx                  # Main page with auth guard
├── echo/
│   └── index.ts                  # Echo SDK configuration
└── components/
    ├── ai-elements/              # Reusable AI chat components
    └── ui/                       # Base UI components (shadcn/ui)
```

### Key Components

#### 1. Echo SDK Configuration (`src/echo/index.ts`)

```typescript
import Echo from '@merit-systems/echo-next-sdk';

export const { handlers, isSignedIn, openai, anthropic } = Echo({
  appId: 'your-echo-app-id',
});
```

#### 2. Authentication Flow

- **Sign-in**: Uses Echo's built-in authentication system
- **Session Management**: Automatic session handling across requests
- **Auth Guards**: Pages check authentication status server-side

#### 3. AI Integration

- **Model Access**: Direct access to OpenAI models through Echo
- **Automatic Billing**: All AI usage is tracked and billed automatically
- **Streaming**: Real-time response streaming with reasoning display

#### 4. Balance Management

- **Real-time Updates**: Live balance display in the header
- **Automatic Deduction**: Costs automatically deducted from user balance
- **Top-up Integration**: Users can add funds through Echo platform

## 🔧 Echo Integration Details

### Authentication

The app uses Echo's authentication system which provides:

- Secure OAuth-based sign-in
- Session management
- User identity verification

```typescript
// Check if user is signed in (server-side)
const signedIn = await isSignedIn();

// Sign in user (client-side)
import { signIn } from '@merit-systems/echo-next-sdk/client';
signIn();
```

### AI Model Access

Echo provides direct access to AI models with automatic billing:

```typescript
import { openai } from '@/echo';

// Use OpenAI models with automatic billing
const result = streamText({
  model: openai('gpt-4o'), // or "gpt-5-nano"
  messages: convertToModelMessages(messages),
});
```

### Balance Management

Real-time balance tracking and display:

```typescript
import { useEcho } from '@merit-systems/echo-next-sdk/client';

const echoClient = useEcho();
const balanceData = await echoClient.balance.getBalance();
```

### API Endpoints

Echo provides webhook handlers for various platform events:

```typescript
// src/app/api/echo/[...echo]/route.ts
import { handlers } from '@/echo';
export const { GET, POST } = handlers;
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- An Echo account ([sign up here](https://echo.merit.systems))

### Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd my-next-ai-app
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Configure Echo**
   - Visit [echo.merit.systems](https://echo.merit.systems)
   - Create a new app and get your App ID
   - Update `src/echo/index.ts` with your App ID

4. **Run the development server**

   ```bash
   pnpm dev
   ```

5. **Open the app**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Setup

No environment variables needed! Echo handles all configuration through the App ID.

## 📚 Learn More

### Echo Documentation

- **Platform**: [echo.merit.systems](https://echo.merit.systems)
- **Next.js Integration Guide**: [echo.merit.systems/docs/nextjs](https://echo.merit.systems/docs/nextjs)
- **API Documentation**: Available in your Echo dashboard

### Technology Stack

- **Framework**: Next.js 15 with App Router
- **AI SDK**: Vercel AI SDK with Echo integration
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives with shadcn/ui
- **Authentication**: Echo built-in auth system
- **Billing**: Automatic through Echo platform

## 🔄 How It Works

1. **User Authentication**: Users sign in through Echo's secure authentication system
2. **Balance Check**: App displays user's current balance in real-time
3. **AI Interaction**: Users chat with AI models (GPT-4o, GPT-5 nano)
4. **Automatic Billing**: Each AI request is automatically tracked and billed
5. **Balance Updates**: User balance is updated in real-time after each request

## 💡 Key Benefits of Echo

- **Zero Infrastructure Setup**: No need to manage API keys, billing systems, or user databases
- **Automatic Cost Tracking**: Every AI request is tracked and billed automatically
- **Built-in Authentication**: Secure user management out of the box
- **Multi-Model Support**: Access to multiple AI providers through one interface
- **Real-time Balance**: Users can see their usage and remaining balance instantly
- **Developer Friendly**: Simple SDK integration with minimal boilerplate

## 🚀 Deployment

This app can be deployed to any platform that supports Next.js:

- **Vercel** (recommended): `vercel deploy`
- **Netlify**: Connect your git repository
- **Railway**: `railway deploy`
- **Docker**: Use the included Dockerfile

Make sure to update your Echo app configuration with your production domain.

## 📞 Support

- **Echo Platform**: [echo.merit.systems](https://echo.merit.systems)
- **Documentation**: [echo.merit.systems/docs/nextjs](https://echo.merit.systems/docs/nextjs)
- **Issues**: Create an issue in this repository

---

Built with ❤️ using [Echo](https://echo.merit.systems) - The simplest way to build AI applications with built-in billing and user management.
