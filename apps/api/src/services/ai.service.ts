// Orchestrates: fetch history from DB → call ML service → return result.
// The Express controllers never call mlClient directly — they go through here.

import * as repo from "../repositories/ai.repository";
import { getForecast, detectAnomalies } from "../utils/mlClient";
import { AppError } from "../utils/AppError";

export async function forecastResourceCost(resourceId: string, organizationId: string) {
  const result = await repo.getDailyHistoryForResource(resourceId, organizationId);
  if (!result) throw new AppError("Resource not found", 404);

  const { resource, rows } = result;

  if (rows.length < 14) {
    throw new AppError(
      "Not enough cost history for forecasting. At least 14 days of data required.",
      422
    );
  }

  const data = rows.map((r) => ({
    date:   r.date.toISOString().slice(0, 10),
    amount: Number(r.amount),
  }));

  const forecast = await getForecast(data, 30);

  return {
    resourceId:   resource.id,
    resourceName: resource.name,
    history:      data,
    ...forecast,
  };
}

export async function forecastOrgCost(organizationId: string) {
  const rows = await repo.getDailyHistoryForOrg(organizationId);

  if (rows.length < 14) {
    throw new AppError(
      "Not enough cost history for forecasting. At least 14 days of data required.",
      422
    );
  }

  const data = rows.map((r) => ({
    date:   r.date.toISOString().slice(0, 10),
    amount: Number(r.amount),
  }));

  const forecast = await getForecast(data, 30);

  return {
    organizationId,
    history: data,
    ...forecast,
  };
}

export async function detectCostAnomalies(organizationId: string) {
  const rows = await repo.getAllResourceDailyHistory(organizationId);

  if (rows.length < 10) {
    throw new AppError("Not enough cost data for anomaly detection.", 422);
  }

  const data = rows.map((r) => ({
    date:       r.date.toISOString().slice(0, 10),
    amount:     Number(r.amount),
    resourceId: r.resource_id,
  }));

  const result = await detectAnomalies(data, 0.05);

  // Filter down to only anomalous points for the response —
  // the frontend only needs to know about the flagged ones.
  const flagged = result.anomalies.filter((a) => a.isAnomaly);

  return {
    organizationId,
    totalAnomalies: result.totalAnomalies,
    anomalyRate:    result.anomalyRate,
    anomalies:      flagged,
  };
}