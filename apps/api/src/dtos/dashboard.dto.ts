// These interfaces describe exactly what every dashboard endpoint returns.
// The frontend can import these types (once you share them) so both sides
// agree on the shape without guessing.

export interface DashboardSummary {
  costs: {
    currentMonth: number;
    currentWeek:  number;
    today:        number;
    currency:     string;
  };
  resources: {
    active: number;
    unused: number;
    total:  number;
  };
  savings: {
    potential: number;    // sum of all open recommendations
  };
  budgets: {
    total:    number;     // number of budgets
    exceeded: number;     // number that are over their limit
  };
}

export interface RecentAlert {
  id:         string;
  type:       string;
  status:     string;
  message:    string;
  createdAt:  string;
  resourceId: string | null;
  budgetId:   string | null;
}

export interface DailyCostPoint {
  date:   string;         // "2026-06-01"
  amount: number;
}

export interface MonthlyCostPoint {
  month:  string;         // "2026-06"
  amount: number;
}

export interface CostByService {
  resourceType: string;
  amount:       number;
}

export interface BudgetStatus {
  id:           string;
  name:         string;
  scope:        string;
  monthlyLimit: number;
  spent:        number;
  remaining:    number;
  percentUsed:  number;
  isExceeded:   boolean;
}