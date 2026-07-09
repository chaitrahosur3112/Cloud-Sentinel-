import * as repo from "../repositories/alert.repository";
import { cacheBust } from "../utils/cache";
import { AlertFilter, AlertResponse } from "../dtos/alert.dto";
import { AppError } from "../utils/AppError";

function formatAlert(a: {
  id: string; type: string; status: string; message: string;
  createdAt: Date; resolvedAt: Date | null;
  resourceId: string | null; budgetId: string | null;
}): AlertResponse {
  return {
    id:         a.id,
    type:       a.type,
    status:     a.status,
    message:    a.message,
    createdAt:  a.createdAt.toISOString(),
    resolvedAt: a.resolvedAt ? a.resolvedAt.toISOString() : null,
    resourceId: a.resourceId,
    budgetId:   a.budgetId,
  };
}

export async function listAlerts(filter: AlertFilter) {
  const VALID_TYPES   = ["COST_SPIKE", "BUDGET_EXCEEDED", "IDLE_RESOURCE", "HIGH_CPU_COST", "STORAGE_INCREASE"];
  const VALID_STATUSES = ["OPEN", "ACKNOWLEDGED", "RESOLVED"];

  if (filter.type   && !VALID_TYPES.includes(filter.type))     throw new AppError(`Invalid alert type: ${filter.type}`, 400);
  if (filter.status && !VALID_STATUSES.includes(filter.status)) throw new AppError(`Invalid alert status: ${filter.status}`, 400);

  const { total, alerts } = await repo.findAlerts(filter);

  return {
    data: alerts.map(formatAlert),
    pagination: {
      total,
      page:       filter.page,
      limit:      filter.limit,
      totalPages: Math.ceil(total / filter.limit),
    },
  };
}

export async function acknowledgeAlert(id: string, organizationId: string) {
  const alert = await repo.findAlertById(id);
  if (!alert) throw new AppError("Alert not found", 404);
  if (alert.status !== "OPEN") throw new AppError("Only OPEN alerts can be acknowledged", 400);

  const updated = await repo.acknowledgeAlert(id);
  await cacheBust(`dashboard:alerts:${organizationId}`);
  return formatAlert(updated);
}

export async function resolveAlert(id: string, organizationId: string) {
  const alert = await repo.findAlertById(id);
  if (!alert) throw new AppError("Alert not found", 404);
  if (alert.status === "RESOLVED") throw new AppError("Alert is already resolved", 400);

  const updated = await repo.resolveAlert(id);
  await cacheBust(`dashboard:alerts:${organizationId}`);
  return formatAlert(updated);
}