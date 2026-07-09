// All queries here use $queryRaw because they need DATE_TRUNC
// and GROUP BY on computed date columns — not expressible via Prisma's API.
// Prisma.sql`` safely parameterizes all values — no SQL injection risk.

import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

interface DailyRow    { date: Date;     total: unknown }
interface RegionRow   { region: string; total: unknown }
interface ProviderRow { provider: string; total: unknown }
interface TopRow {
  resource_id: string; resource_name: string;
  resource_type: string; provider: string; total: unknown;
}

export async function getCostTrend(organizationId: string, from: Date, to: Date) {
  return prisma.$queryRaw<DailyRow[]>(Prisma.sql`
    SELECT
      DATE_TRUNC('day', cr.date) AS date,
      SUM(cr.amount)             AS total
    FROM cost_records cr
    JOIN resources r       ON r.id  = cr."resourceId"
    JOIN cloud_accounts ca ON ca.id = r."cloudAccountId"
    WHERE ca."organizationId" = ${organizationId}
      AND cr.date >= ${from}
      AND cr.date <= ${to}
    GROUP BY DATE_TRUNC('day', cr.date)
    ORDER BY date ASC
  `);
}

export async function getCostByRegion(organizationId: string, from: Date, to: Date) {
  return prisma.$queryRaw<RegionRow[]>(Prisma.sql`
    SELECT
      COALESCE(r.region, 'unknown') AS region,
      SUM(cr.amount)                AS total
    FROM cost_records cr
    JOIN resources r       ON r.id  = cr."resourceId"
    JOIN cloud_accounts ca ON ca.id = r."cloudAccountId"
    WHERE ca."organizationId" = ${organizationId}
      AND cr.date >= ${from}
      AND cr.date <= ${to}
    GROUP BY r.region
    ORDER BY total DESC
  `);
}

export async function getCostByProvider(organizationId: string, from: Date, to: Date) {
  return prisma.$queryRaw<ProviderRow[]>(Prisma.sql`
    SELECT
      ca.provider,
      SUM(cr.amount) AS total
    FROM cost_records cr
    JOIN resources r       ON r.id  = cr."resourceId"
    JOIN cloud_accounts ca ON ca.id = r."cloudAccountId"
    WHERE ca."organizationId" = ${organizationId}
      AND cr.date >= ${from}
      AND cr.date <= ${to}
    GROUP BY ca.provider
    ORDER BY total DESC
  `);
}

export async function getTopResources(organizationId: string, from: Date, to: Date, topN = 10) {
  return prisma.$queryRaw<TopRow[]>(Prisma.sql`
    SELECT
      r.id           AS resource_id,
      r.name         AS resource_name,
      r.type         AS resource_type,
      ca.provider,
      SUM(cr.amount) AS total
    FROM cost_records cr
    JOIN resources r       ON r.id  = cr."resourceId"
    JOIN cloud_accounts ca ON ca.id = r."cloudAccountId"
    WHERE ca."organizationId" = ${organizationId}
      AND cr.date >= ${from}
      AND cr.date <= ${to}
    GROUP BY r.id, r.name, r.type, ca.provider
    ORDER BY total DESC
    LIMIT ${topN}
  `);
}