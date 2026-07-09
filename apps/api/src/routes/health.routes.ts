import { Router } from "express";
import { prisma } from "../config/prisma";
import { redis } from "../config/redis";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// This single endpoint is what proves Phase 2 actually works: it doesn't
// just say the server is "up", it round-trips to Postgres AND Redis and
// reports both. That's the test you'll run after `docker-compose up`.
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const checks: Record<string, "ok" | "down"> = {
      database: "down",
      redis: "down",
    };

    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = "ok";
    } catch {
      checks.database = "down";
    }

    try {
      await redis.ping();
      checks.redis = "ok";
    } catch {
      checks.redis = "down";
    }

    const healthy = Object.values(checks).every((status) => status === "ok");

    res.status(healthy ? 200 : 503).json({
      success: healthy,
      checks,
      timestamp: new Date().toISOString(),
    });
  })
);

export default router;
