import { PrismaClient } from "@prisma/client";

// Why a singleton: every controller/service in the app imports THIS one
// instance instead of creating `new PrismaClient()` itself. Creating
// multiple clients opens multiple connection pools to Postgres — a classic
// beginner mistake that quietly exhausts your database connections.

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}
