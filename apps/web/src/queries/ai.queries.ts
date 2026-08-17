import { useQuery } from "react-query";
import { api } from "../lib/axios";
import { ForecastResult } from "../types";

export function useForecastOrg() {
  return useQuery("forecast-org", async () => {
    const { data } = await api.get("/ai/forecast/org");
    return data.data as ForecastResult;
  }, { retry: false });
}

export function useForecastResource(resourceId: string) {
  return useQuery(["forecast-resource", resourceId], async () => {
    const { data } = await api.get(`/ai/forecast/${resourceId}`);
    return data.data as ForecastResult;
  }, { enabled: !!resourceId, retry: false });
}

export function useAnomalies() {
  return useQuery("anomalies", async () => {
    const { data } = await api.get("/ai/anomalies");
    return data.data as {
      totalAnomalies: number; anomalyRate: number;
      anomalies: Array<{ date: string; amount: number; resourceId: string; anomalyScore: number }>;
    };
  }, { retry: false });
}