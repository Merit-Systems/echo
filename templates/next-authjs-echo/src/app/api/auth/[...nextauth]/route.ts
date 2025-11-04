import NextAuth from 'next-auth';
import Echo from '@merit/echo-authjs-provider';

// Auth.js v5 route handler for Next.js App Router
const auth = NextAuth({
  providers: [
    Echo({
      appId: process.env.ECHO_APP_ID!,
    }),
  ],
  // You can add callbacks, session strategy, etc., here if needed
});

export const { GET, POST } = auth;
