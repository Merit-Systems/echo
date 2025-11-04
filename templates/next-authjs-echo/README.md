# Echo Auth.js with Next.js Template

This template demonstrates how to integrate Echo authentication into a Next.js application using Auth.js (NextAuth.js v5).

## Prerequisites

- Node.js 18+ and pnpm
- An Echo App ID (UUID v4 format)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/Merit-Systems/echo.git
   cd echo/templates/next-authjs-echo
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Copy the example environment file and update with your Echo App ID:
   ```bash
   cp .env.local.example .env.local
   ```
   Update the values in `.env.local`:
   ```
   AUTH_SECRET=your-secret-here
   AUTH_TRUST_HOST=true
   ECHO_APP_ID=your-echo-app-id-here
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **Sign In/Out**: Pre-built components for authentication flows
- **Session Management**: Access user session data throughout your app
- **Protected Routes**: Example of protecting pages with authentication

## Components

### `SignInButton`
A button component that initiates the Echo sign-in flow.

### `SignOutButton`
A button component to sign out the current user.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTH_SECRET` | Yes | A secret string used to encrypt cookies and tokens |
| `AUTH_TRUST_HOST` | Yes (dev) | Set to `true` for development |
| `ECHO_APP_ID` | Yes | Your Echo App ID (UUID v4) |
| `AUTH_URL` | No | Your production URL (e.g., `https://yourapp.com`) |

## Deployment

1. Set up your production environment variables
2. Build the application:
   ```bash
   pnpm build
   ```
3. Start the production server:
   ```bash
   pnpm start
   ```

## Learn More

- [Echo Documentation](https://docs.echo.merit.systems)
- [Next.js Documentation](https://nextjs.org/docs)
- [Auth.js Documentation](https://authjs.dev/)

## License

MIT
