import { getEchoToken } from '@/echo';

function rewriteToEchoRouter(original: string): string {
  try {
    const url = new URL(original);
    // Replace Google host with Echo router host
    url.host = 'echo-staging.up.railway.app';
    // Ensure protocol is https
    url.protocol = 'https:';
    return url.toString();
  } catch {
    return original;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const uri = searchParams.get('uri');
  const download = searchParams.get('download');

  if (!uri) {
    return new Response('Missing uri parameter', { status: 400 });
  }

  try {
    const apiKey = await getEchoToken();
    if (!apiKey) return new Response('API key not configured', { status: 500 });

    // Rewrite upstream URL to Echo router
    const upstreamUrl = rewriteToEchoRouter(uri);
    // Forward range/conditional headers
    const headers = new Headers({ Authorization: `Bearer ${apiKey}` });
    const range = req.headers.get('range');
    const ifNoneMatch = req.headers.get('if-none-match');
    const ifModifiedSince = req.headers.get('if-modified-since');
    if (range) headers.set('range', range);
    if (ifNoneMatch) headers.set('if-none-match', ifNoneMatch);
    if (ifModifiedSince) headers.set('if-modified-since', ifModifiedSince);

    const upstream = await fetch(upstreamUrl, { headers });

    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text().catch(() => '');
      return new Response(text || 'Failed to fetch video', {
        status: upstream.status || 502,
      });
    }

    // Pass-through upstream headers/status; optionally force download
    const respHeaders = new Headers();
    const copy = (name: string) => {
      const v = upstream.headers.get(name);
      if (v) respHeaders.set(name, v);
    };
    copy('content-type');
    copy('content-length');
    copy('content-range');
    copy('accept-ranges');
    copy('cache-control');
    copy('etag');
    copy('last-modified');
    if (download === '1') {
      const filename = `video_${Date.now()}.mp4`;
      respHeaders.set(
        'content-disposition',
        `attachment; filename="${filename}"`
      );
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers: respHeaders,
    });
  } catch (err) {
    console.error('Proxy video error:', err);
    return new Response('Proxy failed', { status: 500 });
  }
}
