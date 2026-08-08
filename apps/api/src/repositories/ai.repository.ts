// Fetches the cost history the ML service needs.
// We fetch 90 days of daily cost records — more history = better forecast.

import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

interface DailyRow { date: Date; amount: unknown; resource_id: string }

export async function getDailyHistoryForResource(
  resourceId:     string,
  organizationId: string,
) {
  // Verify the resource belongs to this org before fetching
  const resource = await prisma.resource.findFirst({
    where: { id: resourceId, cloudAccount: { organizationId } },
    select: { id: true, name: true },
  });
  if (!resource) return null;

  const rows = await prisma.$queryRaw<DailyRow[]>(Prisma.sql`
    SELECT
      DATE_TRUNC('day', date) AS date,
      SUM(amount)             AS amount,
      ${resourceId}::text     AS resource_id
    FROM cost_records
    WHERE "resourceId" = ${resourceId}
      AND date >= ${daysAgo(90)}
    GROUP BY DATE_TRUNC('day', date)
    ORDER BY date ASC
  `);

  return { resource, rows };
}

export async function getDailyHistoryForOrg(organizationId: string) {
  const rows = await prisma.$queryRaw<DailyRow[]>(Prisma.sql`
    SELECT
      DATE_TRUNC('day', cr.date) AS date,
      SUM(cr.amount)             AS amount,
      'org'::text                AS resource_id
    FROM cost_records cr
    JOIN resources r       ON r.id  = cr."resourceId"
    JOIN cloud_accounts ca ON ca.id = r."cloudAccountId"
    WHERE ca."organizationId" = ${organizationId}
      AND cr.date >= ${daysAgo(90)}
    GROUP BY DATE_TRUNC('day', cr.date)
    ORDER BY date ASC
  `);

  return rows;
}

export async function getAllResourceDailyHistory(organizationId: string) {
  // For anomaly detection we need all resources' daily costs.
  // We include resourceId so the ML service can group by it.
  const rows = await prisma.$queryRaw<DailyRow[]>(Prisma.sql`
    SELECT
      DATE_TRUNC('day', cr.date) AS date,
      cr.amount                  AS amount,
      r.id                       AS resource_id
    FROM cost_records cr
    JOIN resources r       ON r.id  = cr."resourceId"
    JOIN cloud_accounts ca ON ca.id = r."cloudAccountId"
    WHERE ca."organizationId" = ${organizationId}
      AND cr.date >= ${daysAgo(90)}
    ORDER BY cr.date ASC
  `);

  return rows;
}