# Echo React Chat Template

A chat application built with React, Vite, and Echo SDK, featuring client-side authentication and AI billing.

## Quick Start

Use the Echo CLI to create a new project with this template:

```bash
npx echo-start@latest --template react-chat
```

You'll be prompted for your Echo App ID. Don't have one? Get it at [echo.merit.systems/new](https://echo.merit.systems/new).

---

A minimal example showing how to use the Echo React SDK with Vite.

## What it demonstrates

- **Unauthenticated state**: Shows sign-in button when user is not authenticated
- **Zero balance state**: Shows token purchase component when user has no credits
- **Success state**: Shows welcome message when user has credits

## Running the example

```bash
bun install
bun run dev
```

## Code structure

The entire app is in `src/App.tsx` - just 70 lines of code demonstrating:

1. Setting up `EchoProvider` with configuration
2. Using `useEcho` hook to check authentication and balance
3. Conditionally rendering different UI states
4. Using `EchoSignIn` and `EchoTokens` components

This shows the complete user journey from sign-up to having a positive balance.
