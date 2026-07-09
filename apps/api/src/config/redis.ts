import Redis from "ioredis";
import { env } from "./env";
import { logger } from "../utils/logger";

// Same singleton reasoning as prisma.ts — one connection, shared everywhere.
// This client will be used for two things later: caching dashboard queries
// (Phase 4) and rate limiting login attempts (Phase 3).

export const redis = new Redis(env.redisUrl, {
  // Don't crash the whole process if Redis is briefly unavailable on boot —
  // retry instead. maxRetriesPerRequest: null lets ioredis queue commands
  // while it reconnects.
  maxRetriesPerRequest: null,
});

redis.on("connect", () => {
  logger.info("Redis connected");
});

redis.on("error", (err) => {
  logger.error(`Redis error: ${err.message}`);
});

export async function disconnectRedis(): Promise<void> {
  redis.disconnect();
}
