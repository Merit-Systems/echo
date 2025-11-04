import NextAuth from "next-auth"
import Echo from "@merit-systems/echo-authjs-provider"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Echo({
      appId: process.env.ECHO_APP_ID!,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      return session;
    },
  },
})