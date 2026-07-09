import * as repo    from "../repositories/analytics.repository";
import { cacheGet, cacheSet } from "../utils/cache";
import { DateRangeFilter, CostTrendPoint, CostByRegion, CostByProvider, TopResource } from "../dtos/analytics.dto";

const TTL = 300;

// Cache key includes from+to dates so different date ranges get separate caches
function key(orgId: string, type: string, from: Date, to: Date): string {
  return `analytics:${type}:${orgId}:${from.toISOString().slice(0,10)}:${to.toISOString().slice(0,10)}`;
}

export async function getCostTrend(filter: DateRangeFilter): Promise<CostTrendPoint[]> {
  const cacheKey = key(filter.organizationId, "trend", filter.from, filter.to);
  const cached   = await cacheGet<CostTrendPoint[]>(cacheKey);
  if (cached) return cached;

  const rows = await repo.getCostTrend(filter.organizationId, filter.from, filter.to);
  const result: CostTrendPoint[] = rows.map((r) => ({
    date:   r.date.toISOString().slice(0, 10),
    amount: Number(r.total),
  }));

  await cacheSet(cacheKey, result, TTL);
  return result;
}

export async function getCostByRegion(filter: DateRangeFilter): Promise<CostByRegion[]> {
  const cacheKey = key(filter.organizationId, "region", filter.from, filter.to);
  const cached   = await cacheGet<CostByRegion[]>(cacheKey);
  if (cached) return cached;

  const rows = await repo.getCostByRegion(filter.organizationId, filter.from, filter.to);
  const result: CostByRegion[] = rows.map((r) => ({
    region: r.region,
    amount: Number(r.total),
  }));

  await cacheSet(cacheKey, result, TTL);
  return result;
}

export async function getCostByProvider(filter: DateRangeFilter): Promise<CostByProvider[]> {
  const cacheKey = key(filter.organizationId, "provider", filter.from, filter.to);
  const cached   = await cacheGet<CostByProvider[]>(cacheKey);
  if (cached) return cached;

  const rows = await repo.getCostByProvider(filter.organizationId, filter.from, filter.to);
  const result: CostByProvider[] = rows.map((r) => ({
    provider: r.provider,
    amount:   Number(r.total),
  }));

  await cacheSet(cacheKey, result, TTL);
  return result;
}

export async function getTopResources(filter: DateRangeFilter): Promise<TopResource[]> {
  const cacheKey = key(filter.organizationId, "top-resources", filter.from, filter.to);
  const cached   = await cacheGet<TopResource[]>(cacheKey);
  if (cached) return cached;

  const rows = await repo.getTopResources(filter.organizationId, filter.from, filter.to);
  const result: TopResource[] = rows.map((r) => ({
    resourceId:   r.resource_id,
    resourceName: r.resource_name,
    resourceType: r.resource_type,
    provider:     r.provider,
    amount:       Number(r.total),
  }));

  await cacheSet(cacheKey, result, TTL);
  return result;
}