import * as repo  from "../repositories/resource.repository";
import { cacheGet, cacheSet } from "../utils/cache";
import { ResourceFilter, ResourceDetail, ResourceListItem, ResourceTypeSummary } from "../dtos/resource.dto";
import { AppError } from "../utils/AppError";

const TTL = 300;
const key  = (orgId: string, s: string) => `resources:${s}:${orgId}`;

export async function listResources(filter: ResourceFilter) {
  // We don't cache list results because the filter params make too many
  // combinations. Instead the DB query itself is fast due to indexes.
  const { total, resources } = await repo.findResources(filter);

  const items: ResourceListItem[] = resources.map((r) => ({
    id:               r.id,
    name:             r.name,
    type:             r.type,
    region:           r.region,
    provider:         r.cloudAccount.provider,
    accountName:      r.cloudAccount.accountName,
    currentMonthCost: r.costRecords.reduce((sum, c) => sum + Number(c.amount), 0),
    hasOpenAlerts:    r.alerts.length > 0,
  }));

  return {
    data:       items,
    pagination: {
      total,
      page:       filter.page,
      limit:      filter.limit,
      totalPages: Math.ceil(total / filter.limit),
    },
  };
}

export async function getResourceDetail(id: string, organizationId: string) {
  const r = await repo.findResourceById(id, organizationId);
  if (!r) throw new AppError("Resource not found", 404);

  const detail: ResourceDetail = {
    id:               r.id,
    name:             r.name,
    type:             r.type,
    region:           r.region,
    provider:         r.cloudAccount.provider,
    accountName:      r.cloudAccount.accountName,
    externalId:       r.externalId,
    currentMonthCost: r.costRecords.reduce((sum, c) => sum + Number(c.amount), 0),
    hasOpenAlerts:    r.alerts.length > 0,
    recommendations:  r.recommendations.map((rec) => ({
      id:               rec.id,
      description:      rec.description,
      estimatedSavings: Number(rec.estimatedSavings),
    })),
    alerts: r.alerts.map((a) => ({
      id:        a.id,
      type:      a.type,
      status:    a.status,
      message:   a.message,
      createdAt: a.createdAt.toISOString(),
    })),
  };

  return detail;
}

export async function getResourceCostHistory(id: string, organizationId: string) {
  // Verify the resource belongs to this org before returning cost data
  const r = await repo.findResourceById(id, organizationId);
  if (!r) throw new AppError("Resource not found", 404);

  const rows = await repo.getResourceCostHistory(id);

  return {
    resourceId:   r.id,
    resourceName: r.name,
    history: rows.map((row) => ({
      date:   row.date.toISOString().slice(0, 10),
      amount: Number(row.total),
    })),
  };
}

export async function getResourceTypeSummary(organizationId: string): Promise<ResourceTypeSummary[]> {
  const cacheKey = key(organizationId, "type-summary");
  const cached   = await cacheGet<ResourceTypeSummary[]>(cacheKey);
  if (cached) return cached;

  const rows = await repo.getResourceTypeSummary(organizationId);
  const result: ResourceTypeSummary[] = rows.map((r) => ({
    type:             r.type,
    count:            Number(r.count),
    totalMonthlyCost: Number(r.total),
  }));

  await cacheSet(cacheKey, result, TTL);
  return result;
}