import { useQuery } from "react-query";
import { api } from "../lib/axios";
import { DashboardSummary, RecentAlert, CostPoint, ServiceCost, BudgetStatus } from "../types";

const get = async <T>(url: string): Promise<T> => {
  const { data } = await api.get(url);
  return data.data as T;
};

export const useDashboardSummary  = () => useQuery("dashboard-summary",  () => get<DashboardSummary>("/dashboard/summary"));
export const useRecentAlerts      = () => useQuery("dashboard-alerts",   () => get<RecentAlert[]>("/dashboard/alerts/recent"));
export const useDailyCosts        = () => useQuery("dashboard-daily",    () => get<CostPoint[]>("/dashboard/costs/daily"));
export const useMonthlyCosts      = () => useQuery("dashboard-monthly",  () => get<CostPoint[]>("/dashboard/costs/monthly"));
export const useCostsByService    = () => useQuery("dashboard-service",  () => get<ServiceCost[]>("/dashboard/costs/by-service"));
export const useBudgetStatus      = () => useQuery("dashboard-budgets",  () => get<BudgetStatus[]>("/dashboard/budgets/status"));