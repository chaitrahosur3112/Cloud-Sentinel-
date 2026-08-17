export type ReportFormat = "PDF" | "EXCEL" | "CSV";
export type ReportType   = "COST_SUMMARY" | "RESOURCE_INVENTORY" | "ANOMALY_REPORT";

export interface GenerateReportDto {
  type:   ReportType;
  format: ReportFormat;
  from?:  string;   // "YYYY-MM-DD" — optional date range
  to?:    string;
}

export interface ReportResponse {
  id:          string;
  type:        string;
  format:      string;
  fileUrl:     string;
  generatedBy: string;
  createdAt:   string;
}