export interface CreateBudgetDto {
  name:         string;
  scope:        "ORGANIZATION" | "DEPARTMENT" | "CLOUD_ACCOUNT";
  monthlyLimit: number;
}

export interface UpdateBudgetDto {
  name:         string;
  scope:        "ORGANIZATION" | "DEPARTMENT" | "CLOUD_ACCOUNT";
  monthlyLimit: number;
}

export interface BudgetResponse {
  id:           string;
  name:         string;
  scope:        string;
  monthlyLimit: number;
  organizationId: string;
  createdAt:    string;
  updatedAt:    string;
}