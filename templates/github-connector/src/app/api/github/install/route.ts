import { getUser } from "@/echo";
import { signState } from "@/lib/crypto";
import { getGitHubAppInstallUrl } from "@/lib/github";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = new URL(getGitHubAppInstallUrl());
    const stateSecret = process.env.GITHUB_APP_STATE_SECRET as string;
    if (!stateSecret) throw new Error("Missing GITHUB_APP_STATE_SECRET");
    const signedState = signState(`uid=${user.id}`, stateSecret);
    url.searchParams.set("state", signedState);
    // Ask GitHub to callback to our handler so we can map echo_user_id
    url.searchParams.set(
      "redirect_url",
      `${
        process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
      }/api/github/install/callback`,
    );
    return NextResponse.redirect(url.toString());
  } catch (e: unknown) {
    return NextResponse.json(
      { error: (e as Error)?.message ?? "Missing GitHub App env" },
      { status: 500 },
    );
  }
}
