// Generates PDF reports using PDFKit.
// PDFKit works like a "cursor on a page" — you move the cursor,
// write text or draw shapes, move it again. Think of it like
// painting on a canvas from top to bottom.

import PDFDocument from "pdfkit";
import fs          from "fs";

interface CostRow {
  name: string; type: string; provider: string;
  date: string; amount: number;
}

interface BudgetRow {
  name: string; scope: string;
  monthlyLimit: number; spent: number;
}

// ---------- Shared layout helpers ----------

function drawHeader(doc: PDFKit.PDFDocument, title: string, orgId: string): void {
  doc
    .fontSize(20).font("Helvetica-Bold")
    .text("CloudCost Sentinel", 50, 50)
    .fontSize(14).font("Helvetica")
    .text(title, 50, 78)
    .fontSize(9).fillColor("#666666")
    .text(`Organization: ${orgId}`, 50, 100)
    .text(`Generated: ${new Date().toUTCString()}`, 50, 114)
    .fillColor("#000000")
    .moveTo(50, 130).lineTo(545, 130).stroke()
    .moveDown(2);
}

function drawTableHeader(doc: PDFKit.PDFDocument, headers: string[], x: number, y: number, colWidths: number[]): void {
  doc.font("Helvetica-Bold").fontSize(9).fillColor("#ffffff");
  doc.rect(x, y, colWidths.reduce((a, b) => a + b, 0), 18).fill("#2563eb");

  let curX = x;
  headers.forEach((header, i) => {
    doc.fillColor("#ffffff").text(header, curX + 4, y + 4, { width: colWidths[i] });
    curX += colWidths[i];
  });
  doc.fillColor("#000000").font("Helvetica").fontSize(9);
}

function drawTableRow(
  doc: PDFKit.PDFDocument,
  cells: string[], x: number, y: number,
  colWidths: number[], isEven: boolean
): void {
  const rowHeight = 16;
  if (isEven) {
    doc.rect(x, y, colWidths.reduce((a, b) => a + b, 0), rowHeight).fill("#f1f5f9");
  }
  doc.fillColor("#000000");
  let curX = x;
  cells.forEach((cell, i) => {
    doc.text(cell, curX + 4, y + 3, { width: colWidths[i] - 8, ellipsis: true });
    curX += colWidths[i];
  });
}

// ---------- Cost Summary PDF ----------

export async function generateCostSummaryPDF(opts: {
  filePath:       string;
  organizationId: string;
  costRows:       CostRow[];
  budgetRows:     BudgetRow[];
}): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc  = new PDFDocument({ margin: 50, size: "A4" });
    const stream = fs.createWriteStream(opts.filePath);
    doc.pipe(stream);

    drawHeader(doc, "Cost Summary Report", opts.organizationId);

    // ---------- Budget Status section ----------
    doc.fontSize(12).font("Helvetica-Bold").text("Budget Status", 50, doc.y).moveDown(0.5);

    const bColWidths = [200, 100, 110, 110];
    drawTableHeader(doc, ["Budget Name", "Scope", "Monthly Limit", "Spent"], 50, doc.y, bColWidths);

    let rowY = doc.y + 18;
    opts.budgetRows.forEach((b, i) => {
      const spent    = opts.costRows.reduce((s, r) => s + r.amount, 0);
      const pct      = b.monthlyLimit > 0 ? Math.round((spent / b.monthlyLimit) * 100) : 0;
      drawTableRow(
        doc,
        [b.name, b.scope, `$${b.monthlyLimit.toLocaleString()}`, `$${spent.toFixed(2)} (${pct}%)`],
        50, rowY, bColWidths, i % 2 === 0
      );
      rowY += 16;
    });

    doc.y = rowY + 16;

    // ---------- Cost Records section ----------
    doc.fontSize(12).font("Helvetica-Bold").text("Cost Records", 50, doc.y).moveDown(0.5);

    const cColWidths = [160, 110, 80, 80, 70];
    drawTableHeader(
      doc, ["Resource", "Provider", "Type", "Date", "Amount ($)"],
      50, doc.y, cColWidths
    );

    rowY = doc.y + 18;
    opts.costRows.slice(0, 100).forEach((row, i) => {   // cap at 100 rows for PDF readability
      if (rowY > 750) { doc.addPage(); rowY = 50; }     // new page if near bottom
      drawTableRow(
        doc,
        [row.name, row.provider, row.type, row.date, row.amount.toFixed(4)],
        50, rowY, cColWidths, i % 2 === 0
      );
      rowY += 16;
    });

    const total = opts.costRows.reduce((s, r) => s + r.amount, 0);
    doc.y = rowY + 8;
    doc.font("Helvetica-Bold").fontSize(10)
       .text(`Total: $${total.toFixed(2)}`, 50, doc.y);

    doc.end();
    stream.on("finish", resolve);
    stream.on("error",  reject);
  });
}

// ---------- Resource Inventory PDF ----------

export async function generateResourceInventoryPDF(opts: {
  filePath:       string;
  organizationId: string;
  resources: Array<{
    name: string; type: string; region: string | null;
    provider: string; accountName: string;
    monthlyCost: number; openAlerts: number;
  }>;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc    = new PDFDocument({ margin: 50, size: "A4", layout: "landscape" });
    const stream = fs.createWriteStream(opts.filePath);
    doc.pipe(stream);

    drawHeader(doc, "Resource Inventory Report", opts.organizationId);

    const colWidths = [160, 110, 90, 80, 100, 80, 70];
    drawTableHeader(
      doc,
      ["Resource Name", "Type", "Region", "Provider", "Account", "Monthly Cost", "Open Alerts"],
      50, doc.y, colWidths
    );

    let rowY = doc.y + 18;
    opts.resources.forEach((r, i) => {
      if (rowY > 520) { doc.addPage(); rowY = 50; }
      drawTableRow(
        doc,
        [
          r.name, r.type, r.region ?? "—",
          r.provider, r.accountName,
          `$${r.monthlyCost.toFixed(2)}`, String(r.openAlerts),
        ],
        50, rowY, colWidths, i % 2 === 0
      );
      rowY += 16;
    });

    doc.end();
    stream.on("finish", resolve);
    stream.on("error",  reject);
  });
}