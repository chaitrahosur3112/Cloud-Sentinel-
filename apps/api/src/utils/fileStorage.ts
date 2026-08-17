// Handles local file storage for generated reports.
// This is the only file that knows WHERE files are stored.
// To move to S3 in production, swap the internals of this file only —
// the report service calls the same functions either way.

import fs   from "fs";
import path from "path";

const REPORTS_DIR = path.join(process.cwd(), "uploads", "reports");

// Create the directory on startup if it doesn't exist
export function ensureReportsDir(): void {
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
}

export function getReportPath(filename: string): string {
  return path.join(REPORTS_DIR, filename);
}

// Returns the public URL path — the download endpoint uses this
export function getReportUrl(filename: string): string {
  return `/uploads/reports/${filename}`;
}

export function buildFilename(
  type: string,
  format: string,
  organizationId: string
): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const ext       = format === "PDF" ? "pdf" : format === "EXCEL" ? "xlsx" : "csv";
  return `${type}_${organizationId}_${timestamp}.${ext}`;
}