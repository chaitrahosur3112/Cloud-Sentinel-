// This is the only file in Express that knows the ML service exists.
// All other files call functions from here — if the ML service URL
// changes, only this file changes.
// We use Node's built-in fetch (available since Node 18).
import { env } from "../config/env";
const ML_SERVICE_URL = env.mlServiceUrl;

export interface CostDataPoint {
  date:   string;
  amount: number;
}

export interface ForecastResult {
  forecast: Array<{
    date:      string;
    predicted: number;
    lower:     number;
    upper:     number;
  }>;
  trend:         string;
  percentChange: number;
}

export interface AnomalyDataPoint extends CostDataPoint {
  resourceId: string;
}

export interface AnomalyResult {
  anomalies: Array<{
    date:         string;
    amount:       number;
    resourceId:   string;
    isAnomaly:    boolean;
    anomalyScore: number;
  }>;
  totalAnomalies: number;
  anomalyRate:    number;
}

async function callML<T>(endpoint: string, body: unknown): Promise<T> {
  const response = await fetch(`${ML_SERVICE_URL}${endpoint}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ML service error (${response.status}): ${error}`);
  }

  return response.json() as Promise<T>;
}

export async function getForecast(
  data: CostDataPoint[],
  periods = 30
): Promise<ForecastResult> {
  return callML<ForecastResult>("/forecast", { data, periods });
}

export async function detectAnomalies(
  data: AnomalyDataPoint[],
  contamination = 0.05
): Promise<AnomalyResult> {
  return callML<AnomalyResult>("/detect-anomalies", { data, contamination });
}