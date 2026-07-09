// The date range filter — both endpoints accept ?from=2026-01-01&to=2026-07-01
// We parse and validate the strings into real Date objects in the validator.
export interface DateRangeFilter {
  organizationId: string;
  from: Date;
  to:   Date;
}

export interface CostTrendPoint {
  date:   string;   // "2026-06-15"
  amount: number;
}

export interface CostByRegion {
  region: string;
  amount: number;
}

export interface CostByProvider {
  provider: string;
  amount:   number;
}

export interface TopResource {
  resourceId:   string;
  resourceName: string;
  resourceType: string;
  provider:     string;
  amount:       number;
}