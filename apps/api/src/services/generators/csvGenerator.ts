// CSV is plain text — commas and newlines.
// No library needed. We just escape values that contain commas or quotes.

function escapeCSV(value: string | number | null): string {
  const str = String(value ?? "");
  // If the value contains a comma, quote, or newline, wrap it in quotes
  // and double any internal quotes (CSV standard escaping).
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCSV(headers: string[], rows: (string | number | null)[][]): string {
  const headerLine = headers.map(escapeCSV).join(",");
  const dataLines  = rows.map((row) => row.map(escapeCSV).join(","));
  return [headerLine, ...dataLines].join("\n");
}

export function generateCostSummaryCSV(opts: {
  organizationId: string;
  costRows: Array<{
    name: string; type: string; provider: string;
    accountName: string; date: string; amount: number;
  }>;
}): string {
  const headers = ["Resource", "Type", "Provider", "Account", "Date", "Amount (USD)"];
  const rows    = opts.costRows.map((r) => [
    r.name, r.type, r.provider, r.accountName, r.date, r.amount,
  ]);
  return buildCSV(headers, rows);
}

export function generateResourceInventoryCSV(opts: {
  resources: Array<{
    name: string; type: string; region: string | null;
    provider: string; accountName: string;
    monthlyCost: number; openAlerts: number;
  }>;
}): string {
  const headers = ["Resource Name", "Type", "Region", "Provider", "Account", "Monthly Cost (USD)", "Open Alerts"];
  const rows    = opts.resources.map((r) => [
    r.name, r.type, r.region ?? "", r.provider,
    r.accountName, r.monthlyCost, r.openAlerts,
  ]);
  return buildCSV(headers, rows);
}