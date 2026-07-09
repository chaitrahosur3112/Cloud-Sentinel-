import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";
import { ResourceFilter } from "../dtos/resource.dto";

// Helper: first day of current month
function startOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

// ---------- List with filtering and pagination ----------

export async function findResources(filter: ResourceFilter) {
  // Build the where clause dynamically based on which filters were provided.
  // The organizationId chain is always present — everything else is optional.
  const where: Prisma.ResourceWhereInput = {
    cloudAccount: {
      organizationId: filter.organizationId,
      ...(filter.provider ? { provider: filter.provider as never } : {}),
    },
    ...(filter.type   ? { type:   filter.type   as never } : {}),
    ...(filter.region ? { region: filter.region }          : {}),
  };

  const skip = (filter.page - 1) * filter.limit;

  // Run count and data queries in parallel
  const [total, resources] = await Promise.all([
    prisma.resource.count({ where }),
    prisma.resource.findMany({
      where,
      skip,
      take: filter.limit,
      orderBy: { createdAt: "desc" },
      include: {
        cloudAccount: { select: { provider: true, accountName: true } },
        // Check if there are any open alerts — used for the alert badge
        alerts: {
          where: { status: "OPEN" },
          select: { id: true },
          take: 1,
        },
        // Current month cost — we aggregate this separately below
        costRecords: {
          where: { date: { gte: startOfMonth() } },
          select: { amount: true },
        },
      },
    }),
  ]);

  return { total, resources };
}

// ---------- Single resource ----------

export async function findResourceById(id: string, organizationId: string) {
  return prisma.resource.findFirst({
    where: { id, cloudAccount: { organizationId } },
    include: {
      cloudAccount: { select: { provider: true, accountName: true } },
      alerts: {
        where: { status: "OPEN" },
        orderBy: { createdAt: "desc" },
        select: { id: true, type: true, status: true, message: true, createdAt: true },
      },
      recommendations: {
        select: { id: true, description: true, estimatedSavings: true },
        orderBy: { estimatedSavings: "desc" },
      },
      costRecords: {
        where: { date: { gte: startOfMonth() } },
        select: { amount: true },
      },
    },
  });
}

// ---------- Cost history (daily for last 90 days) ----------

interface DailyRow { date: Date; total: unknown }

export async function getResourceCostHistory(resourceId: string) {
  return prisma.$queryRaw<DailyRow[]>(Prisma.sql`
    SELECT
      DATE_TRUNC('day', date) AS date,
      SUM(amount)             AS total
    FROM cost_records
    WHERE "resourceId" = ${resourceId}
      AND date >= NOW() - INTERVAL '90 days'
    GROUP BY DATE_TRUNC('day', date)
    ORDER BY date ASC
  `);
}

// ---------- Summary by type ----------

interface TypeSummaryRow {
  type:  string;
  count: bigint;
  total: unknown;
}

export async function getResourceTypeSummary(organizationId: string) {
  return prisma.$queryRaw<TypeSummaryRow[]>(Prisma.sql`
    SELECT
      r.type,
      COUNT(r.id)        AS count,
      COALESCE(SUM(cr.amount), 0) AS total
    FROM resources r
    JOIN cloud_accounts ca ON ca.id = r."cloudAccountId"
    LEFT JOIN cost_records cr
      ON cr."resourceId" = r.id
      AND cr.date >= DATE_TRUNC('month', NOW())
    WHERE ca."organizationId" = ${organizationId}
    GROUP BY r.type
    ORDER BY total DESC
  `);
}