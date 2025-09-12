"use client";

import { signIn } from "@merit-systems/echo-next-sdk/client";

export default function SignInButton() {
  return <button onClick={() => signIn()}>Sign In</button>;
}
