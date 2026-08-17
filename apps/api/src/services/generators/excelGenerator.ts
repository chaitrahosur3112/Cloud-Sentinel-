// Generates .xlsx files using ExcelJS.
// ExcelJS lets you create real workbooks with multiple sheets,
// styled headers, column widths, and number formats — not just CSV renamed.

import ExcelJS from "exceljs";

interface CostRow {
  name: string; type: string; provider: string;
  accountName: string; date: string; amount: number;
}

interface BudgetRow {
  name: string; scope: string; monthlyLimit: number; spent: number;
}

// ---------- Header styling helper ----------

function styleHeaderRow(row: ExcelJS.Row, color = "2563EB"): void {
  row.eachCell((cell) => {
    cell.fill = {
      type:    "pattern",
      pattern: "solid",
      fgColor: { argb: `FF${color}` },
    };
    cell.font      = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border    = {
      bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
    };
  });
  row.height = 22;
}

function styleDataRow(row: ExcelJS.Row, isEven: boolean): void {
  row.eachCell((cell) => {
    cell.fill = {
      type:    "pattern",
      pattern: "solid",
      fgColor: { argb: isEven ? "FFF1F5F9" : "FFFFFFFF" },
    };
    cell.alignment = { vertical: "middle" };
  });
}

// ---------- Cost Summary Excel ----------

export async function generateCostSummaryExcel(opts: {
  filePath:       string;
  organizationId: string;
  costRows:       CostRow[];
  budgetRows:     BudgetRow[];
}): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator     = "CloudCost Sentinel";
  workbook.lastModifiedBy = "CloudCost Sentinel";
  workbook.created     = new Date();

  // ---------- Sheet 1: Summary ----------
  const summarySheet = workbook.addWorksheet("Summary");
  summarySheet.columns = [
    { header: "Metric", key: "metric", width: 30 },
    { header: "Value",  key: "value",  width: 25 },
  ];
  styleHeaderRow(summarySheet.getRow(1));

  const totalSpend  = opts.costRows.reduce((s, r) => s + r.amount, 0);
  const summaryData = [
    { metric: "Organization ID",     value: opts.organizationId },
    { metric: "Report Generated",    value: new Date().toUTCString() },
    { metric: "Total Cost Records",  value: opts.costRows.length },
    { metric: "Total Spend",         value: `$${totalSpend.toFixed(2)}` },
    { metric: "Number of Budgets",   value: opts.budgetRows.length },
  ];
  summaryData.forEach((row, i) => {
    const r = summarySheet.addRow(row);
    styleDataRow(r, i % 2 === 0);
  });

  // ---------- Sheet 2: Budgets ----------
  const budgetSheet = workbook.addWorksheet("Budgets");
  budgetSheet.columns = [
    { header: "Budget Name",    key: "name",         width: 25 },
    { header: "Scope",          key: "scope",         width: 20 },
    { header: "Monthly Limit",  key: "monthlyLimit",  width: 18 },
    { header: "Spent",          key: "spent",         width: 18 },
    { header: "Remaining",      key: "remaining",     width: 18 },
    { header: "% Used",         key: "pct",           width: 12 },
    { header: "Status",         key: "status",        width: 15 },
  ];
  styleHeaderRow(budgetSheet.getRow(1));

  opts.budgetRows.forEach((b, i) => {
    const spent     = opts.costRows.reduce((s) => s + b.spent, 0);
    const remaining = b.monthlyLimit - spent;
    const pct       = b.monthlyLimit > 0 ? Math.round((spent / b.monthlyLimit) * 100) : 0;
    const r = budgetSheet.addRow({
      name:         b.name,
      scope:        b.scope,
      monthlyLimit: b.monthlyLimit,
      spent:        parseFloat(spent.toFixed(2)),
      remaining:    parseFloat(remaining.toFixed(2)),
      pct:          `${pct}%`,
      status:       spent > b.monthlyLimit ? "EXCEEDED" : "OK",
    });
    styleDataRow(r, i % 2 === 0);
    // Red text for exceeded budgets
    if (spent > b.monthlyLimit) {
      r.getCell("status").font = { color: { argb: "FFDC2626" }, bold: true };
    }
  });

  // ---------- Sheet 3: Cost Records ----------
  const costSheet = workbook.addWorksheet("Cost Records");
  costSheet.columns = [
    { header: "Resource",    key: "name",        width: 30 },
    { header: "Type",        key: "type",        width: 22 },
    { header: "Provider",    key: "provider",    width: 12 },
    { header: "Account",     key: "accountName", width: 25 },
    { header: "Date",        key: "date",        width: 14 },
    { header: "Amount (USD)",key: "amount",      width: 16 },
  ];
  styleHeaderRow(costSheet.getRow(1));

  opts.costRows.forEach((row, i) => {
    const r = costSheet.addRow(row);
    styleDataRow(r, i % 2 === 0);
    r.getCell("amount").numFmt = '"$"#,##0.0000';
  });

  // Total row at the bottom
  const totalRow = costSheet.addRow({
    name:   "TOTAL", type: "", provider: "",
    accountName: "", date: "",
    amount: parseFloat(totalSpend.toFixed(2)),
  });
  totalRow.eachCell((cell) => { cell.font = { bold: true }; });
  totalRow.getCell("amount").numFmt = '"$"#,##0.00';

  await workbook.xlsx.writeFile(opts.filePath);
}

// ---------- Resource Inventory Excel ----------

export async function generateResourceInventoryExcel(opts: {
  filePath:       string;
  organizationId: string;
  resources: Array<{
    name: string; type: string; region: string | null;
    provider: string; accountName: string;
    monthlyCost: number; openAlerts: number;
  }>;
}): Promise<void> {
  const workbook    = new ExcelJS.Workbook();
  const sheet       = workbook.addWorksheet("Resources");

  sheet.columns = [
    { header: "Resource Name", key: "name",        width: 32 },
    { header: "Type",          key: "type",        width: 24 },
    { header: "Region",        key: "region",      width: 16 },
    { header: "Provider",      key: "provider",    width: 12 },
    { header: "Account",       key: "accountName", width: 28 },
    { header: "Monthly Cost",  key: "monthlyCost", width: 16 },
    { header: "Open Alerts",   key: "openAlerts",  width: 14 },
  ];
  styleHeaderRow(sheet.getRow(1));

  opts.resources.forEach((r, i) => {
    const row = sheet.addRow({ ...r, region: r.region ?? "—" });
    styleDataRow(row, i % 2 === 0);
    row.getCell("monthlyCost").numFmt = '"$"#,##0.00';
    if (r.openAlerts > 0) {
      row.getCell("openAlerts").font = { color: { argb: "FFDC2626" }, bold: true };
    }
  });

  await workbook.xlsx.writeFile(opts.filePath);
}