import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { disconnectPrisma } from "./config/prisma";
import { disconnectRedis } from "./config/redis";

const app = createApp();

const server = app.listen(env.port, () => {
  logger.info(`CloudCost Sentinel API listening on port ${env.port} (${env.nodeEnv})`);
});

// Why this exists: without it, killing the process with Ctrl+C or a Docker
// stop leaves Postgres/Redis connections dangling until they time out.
// This makes shutdown clean and immediate instead.
async function shutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  server.close(async () => {
    await disconnectPrisma();
    await disconnectRedis();
    logger.info("Shutdown complete");
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
