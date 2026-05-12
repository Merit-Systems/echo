/**
 * Utilities for returning generated images without base64 JSON payloads.
 */

export function imageResponseFromBase64(
  base64: string,
  mediaType: string
): Response {
  const bytes = Buffer.from(base64, 'base64');

  return new Response(new Blob([new Uint8Array(bytes)], { type: mediaType }), {
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': mediaType,
    },
  });
}
