// Every function here filters by organizationId first — always.
// That's the multi-tenancy guarantee: one query escaping that filter
// would be a data breach.

import { prisma } from "../config/prisma";

// Shared helper: first/last day of the current calendar month
function currentMonthRange() {
  const now   = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return { start, end };
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ---------- Cost aggregates ----------

export async function getMonthlyCostTotal(organizationId: string): Promise<number> {
  const { start, end } = currentMonthRange();
  const result = await prisma.costRecord.aggregate({
    where: {
      date: { gte: start, lte: end },
      resource: { cloudAccount: { organizationId } },
    },
    _sum: { amount: true },
  });
  return Number(result._sum.amount ?? 0);
}

export async function getWeeklyCostTotal(organizationId: string): Promise<number> {
  const result = await prisma.costRecord.aggregate({
    where: {
      date: { gte: daysAgo(7) },
      resource: { cloudAccount: { organizationId } },
    },
    _sum: { amount: true },
  });
  return Number(result._sum.amount ?? 0);
}

export async function getDailyCostTotal(organizationId: string): Promise<number> {
  const result = await prisma.costRecord.aggregate({
    where: {
      date: { gte: startOfToday() },
      resource: { cloudAccount: { organizationId } },
    },
    _sum: { amount: true },
  });
  return Number(result._sum.amount ?? 0);
}

// ---------- Resources ----------

export async function getActiveResourceCount(organizationId: string): Promise<number> {
  // "Active" = had at least one cost record in the last 30 days
  return prisma.resource.count({
    where: {
      cloudAccount: { organizationId },
      costRecords: { some: { date: { gte: daysAgo(30) } } },
    },
  });
}

export async function getUnusedResourceCount(organizationId: string): Promise<number> {
  // "Unused" = has an open IDLE_RESOURCE alert
  return prisma.resource.count({
    where: {
      cloudAccount: { organizationId },
      alerts: { some: { type: "IDLE_RESOURCE", status: "OPEN" } },
    },
  });
}

export async function getTotalResourceCount(organizationId: string): Promise<number> {
  return prisma.resource.count({
    where: { cloudAccount: { organizationId } },
  });
}

// ---------- Savings ----------

export async function getPotentialSavingsTotal(organizationId: string): Promise<number> {
  const result = await prisma.recommendation.aggregate({
    where: {
      resource: { cloudAccount: { organizationId } },
    },
    _sum: { estimatedSavings: true },
  });
  return Number(result._sum.estimatedSavings ?? 0);
}

// ---------- Budgets ----------

export async function getBudgetsWithSpend(organizationId: string) {
  const { start, end } = currentMonthRange();

  const budgets = await prisma.budget.findMany({
    where: { organizationId },
  });

  // For each budget, sum up this month's costs within the org.
  // In a real system budgets might be scoped to departments —
  // for Phase 4 we calculate org-wide spend against each budget.
  const budgetsWithSpend = await Promise.all(
    budgets.map(async (budget) => {
      const spend = await prisma.costRecord.aggregate({
        where: {
          date: { gte: start, lte: end },
          resource: { cloudAccount: { organizationId } },
        },
        _sum: { amount: true },
      });
      return { budget, spent: Number(spend._sum.amount ?? 0) };
    })
  );

  return budgetsWithSpend;
}

// ---------- Alerts ----------

export async function getRecentAlerts(organizationId: string, limit = 10) {
  return prisma.alert.findMany({
    where: {
      // Alerts can be linked to a resource (idle resource, cost spike)
      // or a budget (budget exceeded). We need both cases.
      OR: [
        { resource: { cloudAccount: { organizationId } } },
        { budget:   { organizationId } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true, type: true, status: true,
      message: true, createdAt: true,
      resourceId: true, budgetId: true,
    },
  });
}

// ---------- Chart data (raw SQL for date_trunc) ----------
// Prisma's groupBy can't express DATE_TRUNC so we drop to $queryRaw.
// Prisma.sql template tag safely parameterizes values — no SQL injection risk.

import { Prisma } from "@prisma/client";

// Raw query result shapes
interface DailyRow  { date: Date;   total: unknown }
interface MonthlyRow { month: Date; total: unknown }
interface ServiceRow { resource_type: string; total: unknown }

export async function getDailyCosts(organizationId: string): Promise<{ date: string; amount: number }[]> {
  const rows = await prisma.$queryRaw<DailyRow[]>(Prisma.sql`
    SELECT
      DATE_TRUNC('day', cr.date) AS date,
      SUM(cr.amount)             AS total
    FROM cost_records cr
    JOIN resources r      ON r.id              = cr."resourceId"
    JOIN cloud_accounts ca ON ca.id            = r."cloudAccountId"
    WHERE ca."organizationId" = ${organizationId}
      AND cr.date >= NOW() - INTERVAL '30 days'
    GROUP BY DATE_TRUNC('day', cr.date)
    ORDER BY date ASC
  `);

  return rows.map((r) => ({
    date:   r.date.toISOString().slice(0, 10),
    amount: Number(r.total),
  }));
}

export async function getMonthlyCosts(organizationId: string): Promise<{ month: string; amount: number }[]> {
  const rows = await prisma.$queryRaw<MonthlyRow[]>(Prisma.sql`
    SELECT
      DATE_TRUNC('month', cr.date) AS month,
      SUM(cr.amount)               AS total
    FROM cost_records cr
    JOIN resources r       ON r.id              = cr."resourceId"
    JOIN cloud_accounts ca ON ca.id             = r."cloudAccountId"
    WHERE ca."organizationId" = ${organizationId}
      AND cr.date >= NOW() - INTERVAL '12 months'
    GROUP BY DATE_TRUNC('month', cr.date)
    ORDER BY month ASC
  `);

  return rows.map((r) => ({
    month:  r.month.toISOString().slice(0, 7),
    amount: Number(r.total),
  }));
}

export async function getCostsByService(organizationId: string): Promise<{ resourceType: string; amount: number }[]> {
  const { start, end } = currentMonthRange();

  const rows = await prisma.$queryRaw<ServiceRow[]>(Prisma.sql`
    SELECT
      r.type                AS resource_type,
      SUM(cr.amount)        AS total
    FROM cost_records cr
    JOIN resources r       ON r.id              = cr."resourceId"
    JOIN cloud_accounts ca ON ca.id             = r."cloudAccountId"
    WHERE ca."organizationId" = ${organizationId}
      AND cr.date BETWEEN ${start} AND ${end}
    GROUP BY r.type
    ORDER BY total DESC
  `);

  return rows.map((r) => ({
    resourceType: r.resource_type,
    amount:       Number(r.total),
  }));
}