// DTOs for both cloud accounts and resources.
// The ResourceFilter is what the service builds from query params
// and passes to the repository — it's not a req.body shape,
// it's an internal contract between service and repository.

import { CloudProvider, ResourceType } from "@prisma/client";

// --- Cloud Account DTOs ---

export interface ConnectCloudAccountDto {
  provider:       CloudProvider;   // "AWS" | "AZURE" | "GCP"
  accountName:    string;
  credentialsRef: string;          // e.g. "arn:aws:iam::123456789:role/CloudCostReader"
}

// --- Resource DTOs ---

export interface ResourceFilter {
  organizationId: string;
  type?:          ResourceType;
  provider?:      CloudProvider;
  region?:        string;
  page:           number;
  limit:          number;
}

export interface ResourceListItem {
  id:           string;
  name:         string;
  type:         string;
  region:       string | null;
  provider:     string;
  accountName:  string;
  currentMonthCost: number;
  hasOpenAlerts:    boolean;
}

export interface ResourceDetail extends ResourceListItem {
  externalId:      string;
  recommendations: Array<{
    id:               string;
    description:      string;
    estimatedSavings: number;
  }>;
  alerts: Array<{
    id:        string;
    type:      string;
    status:    string;
    message:   string;
    createdAt: string;
  }>;
}

export interface ResourceCostHistory {
  resourceId:   string;
  resourceName: string;
  history: Array<{
    date:   string;
    amount: number;
  }>;
}

export interface ResourceTypeSummary {
  type:  string;
  count: number;
  totalMonthlyCost: number;
}