import { headers } from "next/headers";

interface RateLimitTracker {
  count: number;
  resetTime: number;
}

// In-memory storage for rate limits
const storage = new Map<string, RateLimitTracker>();

// Cleanup interval to prevent memory leaks
let cleanupScheduled = false;
function scheduleCleanup() {
  if (cleanupScheduled) return;
  cleanupScheduled = true;
  
  const interval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of storage.entries()) {
      if (now > record.resetTime) {
        storage.delete(key);
      }
    }
  }, 5 * 60 * 1000); // every 5 minutes
  
  if (interval && typeof interval.unref === "function") {
    interval.unref();
  }
}

export interface RateLimitOptions {
  limit: number;      // Maximum requests allowed in the window
  windowMs: number;   // Window size in milliseconds
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Checks if a client IP has exceeded their request limit for a given action.
 * Uses Next.js headers() to extract the IP address.
 */
export async function rateLimit(
  actionKey: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  scheduleCleanup();

  let ip = "127.0.0.1";
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    
    if (forwardedFor) {
      ip = forwardedFor.split(",")[0].trim();
    } else if (realIp) {
      ip = realIp.trim();
    }
  } catch {
    // Fall back to local address if request headers are unavailable (e.g. during build / seed / test runner)
  }

  const key = `${ip}:${actionKey}`;
  const now = Date.now();
  const tracker = storage.get(key);

  if (!tracker || now > tracker.resetTime) {
    const newTracker: RateLimitTracker = {
      count: 1,
      resetTime: now + options.windowMs,
    };
    storage.set(key, newTracker);
    return {
      success: true,
      limit: options.limit,
      remaining: options.limit - 1,
      reset: newTracker.resetTime,
    };
  }

  if (tracker.count >= options.limit) {
    return {
      success: false,
      limit: options.limit,
      remaining: 0,
      reset: tracker.resetTime,
    };
  }

  tracker.count += 1;
  return {
    success: true,
    limit: options.limit,
    remaining: options.limit - tracker.count,
    reset: tracker.resetTime,
  };
}
