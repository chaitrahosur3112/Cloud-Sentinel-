import { Request, Response } from "express";
import { asyncHandler }      from "../utils/asyncHandler";
import * as reportService    from "../services/report.service";
import { GenerateReportDto } from "../dtos/report.dto";

export const generateReport = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId, userId } = req.user!;
  const result = await reportService.generateReport(
    organizationId, userId, req.body as GenerateReportDto
  );
  res.status(201).json({ success: true, data: result });
});

export const listReports = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const result = await reportService.listReports(organizationId);
  res.status(200).json({ success: true, data: result });
});

export const downloadReport = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const { absolutePath, format, filename } = await reportService.downloadReport(
    req.params.id, organizationId
  );

  // Set the Content-Type and Content-Disposition headers so the
  // browser knows to download the file rather than try to display it.
  const mimeTypes: Record<string, string> = {
    PDF:   "application/pdf",
    EXCEL: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    CSV:   "text/csv",
  };

  res.setHeader("Content-Type", mimeTypes[format] ?? "application/octet-stream");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.sendFile(absolutePath);
});