import { useQuery } from "react-query";
import { api } from "../lib/axios";

function useAnalytics<T>(key: string, endpoint: string, params: { from?: string; to?: string }) {
  return useQuery([key, params], async () => {
    const { data } = await api.get(endpoint, { params });
    return data.data as T;
  });
}

export const useCostTrend    = (p: { from?: string; to?: string }) =>
  useAnalytics<{ date: string; amount: number }[]>("cost-trend",    "/analytics/cost-trend", p);

export const useCostByRegion = (p: { from?: string; to?: string }) =>
  useAnalytics<{ region: string; amount: number }[]>("cost-region", "/analytics/cost-by-region", p);

export const useCostByProvider = (p: { from?: string; to?: string }) =>
  useAnalytics<{ provider: string; amount: number }[]>("cost-provider", "/analytics/cost-by-provider", p);

export const useTopResources = (p: { from?: string; to?: string }) =>
  useAnalytics<{ resourceId: string; resourceName: string; resourceType: string; provider: string; amount: number }[]>(
    "top-resources", "/analytics/top-resources", p
  );