import { createHmac, timingSafeEqual } from "crypto";

export function signState(payload: string, secret: string) {
  const mac = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${mac}`;
}

export function verifyState(signed: string, secret: string) {
  const idx = signed.lastIndexOf(".");
  if (idx <= 0) return null;
  const payload = signed.slice(0, idx);
  const sig = signed.slice(idx + 1);
  const mac = createHmac("sha256", secret).update(payload).digest("hex");
  const ok = timingSafeEqual(Buffer.from(sig), Buffer.from(mac));
  return ok ? payload : null;
}
