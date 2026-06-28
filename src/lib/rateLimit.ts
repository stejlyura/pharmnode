import { headers } from "next/headers";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

interface RateLimitTracker {
  count: number;
  resetTime: number;
}

// In-memory storage for fallback rate limiting
const storage = new Map<string, RateLimitTracker>();

// Cleanup interval for in-memory tracker to prevent memory leaks
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

// Upstash Redis configuration
let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// Cache Ratelimit instances by limit & window size config
const ratelimitInstances = new Map<string, Ratelimit>();

function getRatelimitInstance(limit: number, windowMs: number): Ratelimit | null {
  if (!redis) return null;
  const key = `${limit}:${windowMs}`;
  let instance = ratelimitInstances.get(key);
  if (!instance) {
    instance = new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
      analytics: true,
    });
    ratelimitInstances.set(key, instance);
  }
  return instance;
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
 * Leverages Upstash Redis-based rate limiting in production, and falls back to in-memory in dev.
 */
export async function rateLimit(
  actionKey: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
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
    // Fall back to local address if request headers are unavailable
  }

  const key = `${ip}:${actionKey}`;

  // Try Upstash Redis Rate Limiting
  const limiter = getRatelimitInstance(options.limit, options.windowMs);
  if (limiter) {
    try {
      const { success, limit, remaining, reset } = await limiter.limit(key);
      return {
        success,
        limit,
        remaining,
        reset,
      };
    } catch (err) {
      console.warn("Upstash Rate Limiting failed, falling back to in-memory:", err);
    }
  }

  // Fallback to In-Memory Map
  scheduleCleanup();
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
