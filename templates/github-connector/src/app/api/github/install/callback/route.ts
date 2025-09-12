import { verifyState } from '@/lib/crypto';
import { normalizePrivateKey } from '@/lib/github';
import { getSupabaseServer } from '@/lib/supabase';
import { App } from '@octokit/app';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const installationId = searchParams.get('installation_id');
  const state = searchParams.get('state');
  if (!installationId || !state) {
    return NextResponse.json(
      { error: 'Missing installation_id or state' },
      { status: 400 }
    );
  }
  const secret = process.env.GITHUB_APP_STATE_SECRET as string;
  if (!secret)
    return NextResponse.json(
      { error: 'Missing state secret' },
      { status: 500 }
    );
  const payload = verifyState(state, secret);
  if (!payload || !payload.startsWith('uid=')) {
    return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
  }
  const echoUserId = payload.slice(4);

  // Fetch installation details to capture the owning account login/id
  let accountLogin: string | null = null;
  let accountId: number | null = null;
  try {
    const app = new App({
      appId: process.env.GITHUB_APP_ID!,
      privateKey: normalizePrivateKey(process.env.GITHUB_APP_PRIVATE_KEY!),
    });
    const installationResp = await app.octokit.request(
      'GET /app/installations/{installation_id}',
      { installation_id: Number(installationId) }
    );
    const data = installationResp.data as {
      account?: { login?: string | null; id?: number | null };
    };
    accountLogin = data.account?.login ?? null;
    accountId = data.account?.id ?? null;
  } catch {
    // Non-fatal; continue without account context
  }

  const supabase = getSupabaseServer();
  const { error } = await supabase.from('github_installations').upsert(
    {
      echo_user_id: echoUserId,
      installation_id: Number(installationId),
      account_login: accountLogin,
      account_id: accountId ?? undefined,
    },
    { onConflict: 'echo_user_id,installation_id' }
  );
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
  return NextResponse.redirect(`${origin}/`);
}
