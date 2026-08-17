// All shared TypeScript types — mirrors the DTOs from the Express API.
// Having them in one place means if an API response shape changes,
// you fix it here and TypeScript catches every broken usage.

export interface User {
  id:             string;
  email:          string;
  firstName:      string;
  lastName:       string;
  role:           Role;
  organizationId: string;
}

export type Role =
  | "SUPER_ADMIN" | "ORG_ADMIN" | "FINANCE_MANAGER"
  | "CLOUD_ENGINEER" | "DEVELOPER" | "VIEWER";

export interface DashboardSummary {
  costs:     { currentMonth: number; currentWeek: number; today: number; currency: string };
  resources: { active: number; unused: number; total: number };
  savings:   { potential: number };
  budgets:   { total: number; exceeded: number };
}

export interface RecentAlert {
  id: string; type: string; status: string;
  message: string; createdAt: string;
  resourceId: string | null; budgetId: string | null;
}

export interface CostPoint    { date: string; amount: number }
export interface ServiceCost  { resourceType: string; amount: number }
export interface BudgetStatus {
  id: string; name: string; scope: string;
  monthlyLimit: number; spent: number;
  remaining: number; percentUsed: number; isExceeded: boolean;
}

export interface Resource {
  id: string; name: string; type: string;
  region: string | null; provider: string;
  accountName: string; currentMonthCost: number; hasOpenAlerts: boolean;
}

export interface ResourceDetail extends Resource {
  externalId: string;
  recommendations: Array<{ id: string; description: string; estimatedSavings: number }>;
  alerts: Array<{ id: string; type: string; status: string; message: string; createdAt: string }>;
}

export interface CloudAccount {
  id: string; provider: string; accountName: string;
  resourceCount: number; createdAt: string;
}

export interface Budget {
  id: string; name: string; scope: string;
  monthlyLimit: number; organizationId: string;
  createdAt: string; updatedAt: string;
}

export interface Alert {
  id: string; type: string; status: string; message: string;
  createdAt: string; resolvedAt: string | null;
  resourceId: string | null; budgetId: string | null;
}

export interface Pagination {
  total: number; page: number; limit: number; totalPages: number;
}

export interface ForecastPoint {
  date: string; predicted: number; lower: number; upper: number;
}

export interface ForecastResult {
  forecast: ForecastPoint[]; trend: string; percentChange: number;
  history:  CostPoint[];
}

export interface AnomalyPoint {
  date: string; amount: number; resourceId: string;
  isAnomaly: boolean; anomalyScore: number;
}

export interface Report {
  id: string; format: string; fileUrl: string;
  generatedBy: string; createdAt: string;
}