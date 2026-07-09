export interface AlertFilter {
  organizationId: string;
  type?:   string;
  status?: string;
  page:    number;
  limit:   number;
}

export interface AlertResponse {
  id:         string;
  type:       string;
  status:     string;
  message:    string;
  createdAt:  string;
  resolvedAt: string | null;
  resourceId: string | null;
  budgetId:   string | null;
}