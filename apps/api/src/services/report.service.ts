import fs   from "fs";
import path from "path";
import * as repo from "../repositories/report.repository";
import { GenerateReportDto, ReportResponse } from "../dtos/report.dto";
import { AppError } from "../utils/AppError";
import {
  ensureReportsDir, getReportPath, getReportUrl, buildFilename,
} from "../utils/fileStorage";
import { generateCostSummaryPDF, generateResourceInventoryPDF } from "./generators/pdfGenerator";
import { generateCostSummaryExcel, generateResourceInventoryExcel } from "./generators/excelGenerator";
import { generateCostSummaryCSV, generateResourceInventoryCSV } from "./generators/csvGenerator";

function defaultDateRange() {
  const to   = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return { from, to };
}

export async function generateReport(
  organizationId: string,
  userId: string,
  dto: GenerateReportDto
): Promise<ReportResponse> {
  ensureReportsDir();

  const from = dto.from ? new Date(dto.from) : defaultDateRange().from;
  const to   = dto.to   ? new Date(dto.to)   : defaultDateRange().to;

  const filename = buildFilename(dto.type, dto.format, organizationId);
  const filePath = getReportPath(filename);
  const fileUrl  = getReportUrl(filename);

  // ---------- Fetch data ----------
  let costSummaryData:   Awaited<ReturnType<typeof repo.getCostSummaryData>>   | null = null;
  let resourceInventory: Awaited<ReturnType<typeof repo.getResourceInventoryData>> | null = null;

  if (dto.type === "COST_SUMMARY") {
    costSummaryData = await repo.getCostSummaryData(organizationId, from, to);
  } else if (dto.type === "RESOURCE_INVENTORY") {
    resourceInventory = await repo.getResourceInventoryData(organizationId);
  }

  // ---------- Generate file ----------
  if (dto.type === "COST_SUMMARY" && costSummaryData) {
    const costRows = costSummaryData.costRecords.map((cr) => ({
      name:        cr.resource.name,
      type:        cr.resource.type,
      provider:    cr.resource.cloudAccount.provider,
      accountName: cr.resource.cloudAccount.accountName,
      date:        cr.date.toISOString().slice(0, 10),
      amount:      Number(cr.amount),
    }));

    const budgetRows = costSummaryData.budgets.map((b) => ({
      name:         b.name,
      scope:        b.scope,
      monthlyLimit: Number(b.monthlyLimit),
      spent:        costRows.reduce((s, r) => s + r.amount, 0),
    }));

    if (dto.format === "PDF") {
      await generateCostSummaryPDF({ filePath, organizationId, costRows, budgetRows });
    } else if (dto.format === "EXCEL") {
      await generateCostSummaryExcel({ filePath, organizationId, costRows, budgetRows });
    } else {
      const csv = generateCostSummaryCSV({ organizationId, costRows });
      fs.writeFileSync(filePath, csv, "utf8");
    }

  } else if (dto.type === "RESOURCE_INVENTORY" && resourceInventory) {
    const resources = resourceInventory.map((r) => ({
      name:        r.name,
      type:        r.type,
      region:      r.region,
      provider:    r.cloudAccount.provider,
      accountName: r.cloudAccount.accountName,
      monthlyCost: r.costRecords.reduce((s, c) => s + Number(c.amount), 0),
      openAlerts:  r.alerts.length,
    }));

    if (dto.format === "PDF") {
      await generateResourceInventoryPDF({ filePath, organizationId, resources });
    } else if (dto.format === "EXCEL") {
      await generateResourceInventoryExcel({ filePath, organizationId, resources });
    } else {
      const csv = generateResourceInventoryCSV({ resources });
      fs.writeFileSync(filePath, csv, "utf8");
    }

  } else {
    throw new AppError(`Report type ${dto.type} is not yet supported`, 400);
  }

  // ---------- Save record to DB ----------
  const report = await repo.createReportRecord({
    organizationId,
    generatedById: userId,
    format:        dto.format,
    fileUrl,
  });

  return {
    id:          report.id,
    type:        dto.type,
    format:      report.format,
    fileUrl:     report.fileUrl,
    generatedBy: userId,
    createdAt:   report.createdAt.toISOString(),
  };
}

export async function listReports(organizationId: string): Promise<ReportResponse[]> {
  const reports = await repo.findReportsByOrg(organizationId);
  return reports.map((r) => ({
    id:          r.id,
    type:        "REPORT",
    format:      r.format,
    fileUrl:     r.fileUrl,
    generatedBy: `${r.generatedBy.firstName} ${r.generatedBy.lastName}`,
    createdAt:   r.createdAt.toISOString(),
  }));
}

export async function downloadReport(id: string, organizationId: string) {
  const report = await repo.findReportById(id, organizationId);
  if (!report) throw new AppError("Report not found", 404);

  // Reconstruct absolute path from the stored URL
  const filename     = path.basename(report.fileUrl);
  const absolutePath = getReportPath(filename);

  if (!fs.existsSync(absolutePath)) {
    throw new AppError("Report file no longer exists on disk", 404);
  }

  return { absolutePath, format: report.format, filename };
}