// The service applies caching around every repository call.
// Pattern: check cache → if miss, query DB → store in cache → return.
// Cache TTL is 5 minutes (300 seconds) for all dashboard data.

import * as repo    from "../repositories/dashboard.repository";
import { cacheGet, cacheSet } from "../utils/cache";
import {
  DashboardSummary, RecentAlert, DailyCostPoint,
  MonthlyCostPoint, CostByService, BudgetStatus,
} from "../dtos/dashboard.dto";

const TTL = 300; // 5 minutes
const key  = (orgId: string, suffix: string) => `dashboard:${suffix}:${orgId}`;

export async function getSummary(organizationId: string): Promise<DashboardSummary> {
  const cacheKey = key(organizationId, "summary");
  const cached   = await cacheGet<DashboardSummary>(cacheKey);
  if (cached) return cached;

  // Run all independent queries in parallel — much faster than sequential awaits.
  // Promise.all means all 7 queries fire at the same time and we wait for the
  // slowest one, instead of waiting for each one to finish before starting the next.
  const [
    currentMonth, currentWeek, today,
    active, unused, total,
    potential,
    budgetsWithSpend,
  ] = await Promise.all([
    repo.getMonthlyCostTotal(organizationId),
    repo.getWeeklyCostTotal(organizationId),
    repo.getDailyCostTotal(organizationId),
    repo.getActiveResourceCount(organizationId),
    repo.getUnusedResourceCount(organizationId),
    repo.getTotalResourceCount(organizationId),
    repo.getPotentialSavingsTotal(organizationId),
    repo.getBudgetsWithSpend(organizationId),
  ]);

  const exceededCount = budgetsWithSpend.filter(
    ({ budget, spent }) => spent > Number(budget.monthlyLimit)
  ).length;

  const summary: DashboardSummary = {
    costs:     { currentMonth, currentWeek, today, currency: "USD" },
    resources: { active, unused, total },
    savings:   { potential },
    budgets:   { total: budgetsWithSpend.length, exceeded: exceededCount },
  };

  await cacheSet(cacheKey, summary, TTL);
  return summary;
}

export async function getRecentAlerts(organizationId: string): Promise<RecentAlert[]> {
  const cacheKey = key(organizationId, "alerts");
  const cached   = await cacheGet<RecentAlert[]>(cacheKey);
  if (cached) return cached;

  const alerts = await repo.getRecentAlerts(organizationId);
  const result: RecentAlert[] = alerts.map((a) => ({
    id:         a.id,
    type:       a.type,
    status:     a.status,
    message:    a.message,
    createdAt:  a.createdAt.toISOString(),
    resourceId: a.resourceId,
    budgetId:   a.budgetId,
  }));

  await cacheSet(cacheKey, result, TTL);
  return result;
}

export async function getDailyCosts(organizationId: string): Promise<DailyCostPoint[]> {
  const cacheKey = key(organizationId, "daily");
  const cached   = await cacheGet<DailyCostPoint[]>(cacheKey);
  if (cached) return cached;

  const result = await repo.getDailyCosts(organizationId);
  await cacheSet(cacheKey, result, TTL);
  return result;
}

export async function getMonthlyCosts(organizationId: string): Promise<MonthlyCostPoint[]> {
  const cacheKey = key(organizationId, "monthly");
  const cached   = await cacheGet<MonthlyCostPoint[]>(cacheKey);
  if (cached) return cached;

  const result = await repo.getMonthlyCosts(organizationId);
  await cacheSet(cacheKey, result, TTL);
  return result;
}

export async function getCostsByService(organizationId: string): Promise<CostByService[]> {
  const cacheKey = key(organizationId, "by-service");
  const cached   = await cacheGet<CostByService[]>(cacheKey);
  if (cached) return cached;

  const result = await repo.getCostsByService(organizationId);
  await cacheSet(cacheKey, result, TTL);
  return result;
}

export async function getBudgetStatus(organizationId: string): Promise<BudgetStatus[]> {
  const cacheKey = key(organizationId, "budgets");
  const cached   = await cacheGet<BudgetStatus[]>(cacheKey);
  if (cached) return cached;

  const budgetsWithSpend = await repo.getBudgetsWithSpend(organizationId);

  const result: BudgetStatus[] = budgetsWithSpend.map(({ budget, spent }) => {
    const monthlyLimit = Number(budget.monthlyLimit);
    const remaining    = monthlyLimit - spent;
    const percentUsed  = monthlyLimit > 0
      ? Math.round((spent / monthlyLimit) * 100)
      : 0;

    return {
      id:           budget.id,
      name:         budget.name,
      scope:        budget.scope,
      monthlyLimit,
      spent,
      remaining,
      percentUsed,
      isExceeded:   spent > monthlyLimit,
    };
  });

  await cacheSet(cacheKey, result, TTL);
  return result;
}