// Rate limit guard (5 submissions per 10 minutes per IP) & Cloudflare Turnstile verification

interface RateBucket {
  timestamps: number[];
}

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 5;

const buckets = new Map<string, RateBucket>();

export function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
} {
  const now = Date.now();
  const bucket = buckets.get(ip) || { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < WINDOW_MS);

  if (bucket.timestamps.length >= MAX_REQUESTS) {
    const oldest = bucket.timestamps[0];
    const resetInSeconds = Math.ceil((WINDOW_MS - (now - oldest)) / 1000);
    buckets.set(ip, bucket);
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds,
    };
  }

  bucket.timestamps.push(now);
  buckets.set(ip, bucket);

  return {
    allowed: true,
    remaining: MAX_REQUESTS - bucket.timestamps.length,
    resetInSeconds: Math.ceil(WINDOW_MS / 1000),
  };
}

export async function verifyTurnstileToken(token?: string): Promise<boolean> {
  const siteKey = process.env.PUBLIC_TURNSTILE_SITE_KEY;
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // As documented in 01-frontend.md & 03-enquiry-form.md:
  // Turnstile is active only when both PUBLIC_TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY are populated.
  if (!siteKey || !secretKey) {
    return true;
  }

  if (!token) {
    return false;
  }

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });
    const data = (await res.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch {
    return false;
  }
}
