// A thin wrapper around Redis get/set/delete.
// Why wrap it? So every service that wants caching writes the same pattern
// and we only deal with JSON serialization in one place.
// TTL = Time To Live — after this many seconds Redis automatically deletes the key.

import { redis } from "../config/redis";
import { logger } from "./logger";

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch {
    // If Redis is down we log it but don't crash — the service will just
    // fetch from the database instead (graceful degradation).
    logger.warn(`Cache GET failed for key: ${key}`);
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
    logger.warn(`Cache SET failed for key: ${key}`);
  }
}

export async function cacheBust(pattern: string): Promise<void> {
  try {
    // KEYS is fine for a portfolio project. In production at scale
    // you would use SCAN instead so you don't block Redis while it searches.
    const keys = await redis.keys(pattern);
    if (keys.length > 0) await redis.del(...keys);
  } catch {
    logger.warn(`Cache BUST failed for pattern: ${pattern}`);
  }
}