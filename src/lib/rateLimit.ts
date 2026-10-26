interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * Lightweight in-memory rate limiter for serverless endpoints.
 * @param key unique identifier (e.g. client IP or user ID + route)
 * @param limit maximum requests allowed in window
 * @param windowMs time window in milliseconds (default 60 seconds)
 */
export function checkRateLimit(
  key: string,
  limit: number = 30,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count += 1;
  return { allowed: true, remaining: limit - record.count, resetAt: record.resetAt };
}
