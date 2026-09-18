// Generates PDF reports using PDFKit.
// PDFKit works like a "cursor on a page" — you move the cursor,
// write text or draw shapes, move it again. Think of it like
// painting on a canvas from top to bottom.

import PDFDocument from "pdfkit";
import fs from "fs";

interface CostRow {
  name: string;
  type: string;
  provider: string;
  date: string;
  amount: number;
}

interface BudgetRow {
  name: string;
  scope: string;
  monthlyLimit: number;
  spent: number;
}

// ---------- Shared layout helpers ----------

const PAGE_LEFT = 50;
const PAGE_RIGHT = 545;

function drawHeader(
  doc: PDFKit.PDFDocument,
  title: string,
  orgId: string
): void {
  doc
    .fontSize(20)
    .font("Helvetica-Bold")
    .fillColor("#111827")
    .text("CloudCost Sentinel", PAGE_LEFT, 50);

  doc
    .fontSize(14)
    .font("Helvetica")
    .fillColor("#1f2937")
    .text(title, PAGE_LEFT, 78);

  doc
    .fontSize(9)
    .fillColor("#666666")
    .text(`Organization: ${orgId}`, PAGE_LEFT, 100)
    .text(`Generated: ${new Date().toUTCString()}`, PAGE_LEFT, 114);

  doc
    .strokeColor("#cbd5e1")
    .lineWidth(1)
    .moveTo(PAGE_LEFT, 130)
    .lineTo(PAGE_RIGHT, 130)
    .stroke();

  doc
    .strokeColor("#000000")
    .fillColor("#000000")
    .moveDown(2);
}

function drawTableHeader(
  doc: PDFKit.PDFDocument,
  headers: string[],
  x: number,
  y: number,
  colWidths: number[]
): number {
  const headerHeight = 22;
  const tableWidth = colWidths.reduce((a, b) => a + b, 0);

  doc
    .rect(x, y, tableWidth, headerHeight)
    .fill("#2563eb");

  doc
    .font("Helvetica-Bold")
    .fontSize(8.5)
    .fillColor("#ffffff");

  let curX = x;

  headers.forEach((header, i) => {
    doc.text(header, curX + 5, y + 6, {
      width: colWidths[i] - 10,
      height: headerHeight - 4,
      align: i === headers.length - 1 ? "right" : "left",
    });

    curX += colWidths[i];
  });

  doc
    .fillColor("#000000")
    .font("Helvetica")
    .fontSize(8.5);

  return headerHeight;
}

function drawTableRow(
  doc: PDFKit.PDFDocument,
  cells: string[],
  x: number,
  y: number,
  colWidths: number[],
  isEven: boolean
): number {
  const horizontalPadding = 5;
  const verticalPadding = 5;
  const textWidth = (width: number) => width - horizontalPadding * 2;

  // Calculate the required height for every cell.
  const cellHeights = cells.map((cell, i) =>
    doc.heightOfString(String(cell), {
      width: textWidth(colWidths[i]),
      lineGap: 1,
    })
  );

  // Minimum 22px row height, but allow long values to wrap naturally.
  const rowHeight = Math.max(
    22,
    Math.ceil(Math.max(...cellHeights) + verticalPadding * 2)
  );

  const tableWidth = colWidths.reduce((a, b) => a + b, 0);

  // Alternating row background.
  if (isEven) {
    doc
      .rect(x, y, tableWidth, rowHeight)
      .fill("#f1f5f9");
  }

  // Subtle row separator.
  doc
    .strokeColor("#e2e8f0")
    .lineWidth(0.5)
    .moveTo(x, y + rowHeight)
    .lineTo(x + tableWidth, y + rowHeight)
    .stroke();

  doc
    .fillColor("#111827")
    .font("Helvetica")
    .fontSize(8.5);

  let curX = x;

  cells.forEach((cell, i) => {
    const isLastColumn = i === cells.length - 1;

    doc.text(String(cell), curX + horizontalPadding, y + verticalPadding, {
      width: textWidth(colWidths[i]),
      lineGap: 1,
      align: isLastColumn ? "right" : "left",
    });

    curX += colWidths[i];
  });

  doc
    .fillColor("#000000")
    .strokeColor("#000000");

  return rowHeight;
}

// ---------- Cost Summary PDF ----------

export async function generateCostSummaryPDF(opts: {
  filePath: string;
  organizationId: string;
  costRows: CostRow[];
  budgetRows: BudgetRow[];
}): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: 50,
      size: "A4",
      layout: "portrait",
    });

    const stream = fs.createWriteStream(opts.filePath);

    doc.pipe(stream);

    drawHeader(
      doc,
      "Cost Summary Report",
      opts.organizationId
    );

    // ---------- Budget Status section ----------

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#111827")
      .text("Budget Status", PAGE_LEFT, 150);

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#000000");

    // Total = 495 points.
    // More room is given to Budget Name and Spent.
    const bColWidths = [185, 85, 105, 120];

    const budgetHeaderY = 172;

    const budgetHeaderHeight = drawTableHeader(
      doc,
      ["Budget Name", "Scope", "Monthly Limit", "Spent"],
      PAGE_LEFT,
      budgetHeaderY,
      bColWidths
    );

    let rowY = budgetHeaderY + budgetHeaderHeight;

    opts.budgetRows.forEach((b, i) => {
      const spent = opts.costRows.reduce(
        (s, r) => s + r.amount,
        0
      );

      const pct =
        b.monthlyLimit > 0
          ? Math.round((spent / b.monthlyLimit) * 100)
          : 0;

      const rowHeight = drawTableRow(
        doc,
        [
          b.name,
          b.scope,
          `$${b.monthlyLimit.toLocaleString()}`,
          `$${spent.toFixed(2)} (${pct}%)`,
        ],
        PAGE_LEFT,
        rowY,
        bColWidths,
        i % 2 === 0
      );

      rowY += rowHeight;
    });

    // ---------- Cost Records section ----------

    const costSectionY = rowY + 25;

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#111827")
      .text("Cost Records", PAGE_LEFT, costSectionY);

    /*
     * Total = 495 points.
     *
     * Resource  = 150
     * Provider  = 75
     * Type      = 125   <-- increased significantly
     * Date      = 80
     * Amount    = 65
     *
     * This gives long resource types much more room.
     */
    const cColWidths = [150, 75, 125, 80, 65];

    let costHeaderY = costSectionY + 22;

    let costHeaderHeight = drawTableHeader(
      doc,
      ["Resource", "Provider", "Type", "Date", "Amount ($)"],
      PAGE_LEFT,
      costHeaderY,
      cColWidths
    );

    rowY = costHeaderY + costHeaderHeight;

    opts.costRows.slice(0, 100).forEach((row, i) => {
      // Leave enough room for a normal row plus the total.
      if (rowY > 735) {
        doc.addPage();

        drawHeader(
          doc,
          "Cost Summary Report",
          opts.organizationId
        );

        doc
          .fontSize(12)
          .font("Helvetica-Bold")
          .fillColor("#111827")
          .text("Cost Records (continued)", PAGE_LEFT, 150);

        costHeaderY = 172;

        costHeaderHeight = drawTableHeader(
          doc,
          ["Resource", "Provider", "Type", "Date", "Amount ($)"],
          PAGE_LEFT,
          costHeaderY,
          cColWidths
        );

        rowY = costHeaderY + costHeaderHeight;
      }

      const rowHeight = drawTableRow(
        doc,
        [
          row.name,
          row.provider,
          row.type,
          row.date,
          row.amount.toFixed(4),
        ],
        PAGE_LEFT,
        rowY,
        cColWidths,
        i % 2 === 0
      );

      rowY += rowHeight;
    });

    // ---------- Total ----------

    const total = opts.costRows.reduce(
      (s, r) => s + r.amount,
      0
    );

    // If the total is too close to the bottom, put it on a new page.
    if (rowY > 750) {
      doc.addPage();

      drawHeader(
        doc,
        "Cost Summary Report",
        opts.organizationId
      );

      rowY = 155;
    }

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor("#111827")
      .text(
        `Total: $${total.toFixed(2)}`,
        PAGE_LEFT,
        rowY + 10
      );

    doc.end();

    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

// ---------- Resource Inventory PDF ----------

export async function generateResourceInventoryPDF(opts: {
  filePath: string;
  organizationId: string;
  resources: Array<{
    name: string;
    type: string;
    region: string | null;
    provider: string;
    accountName: string;
    monthlyCost: number;
    openAlerts: number;
  }>;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: 50,
      size: "A4",
      layout: "landscape",
    });

    const stream = fs.createWriteStream(opts.filePath);

    doc.pipe(stream);

    drawHeader(
      doc,
      "Resource Inventory Report",
      opts.organizationId
    );

    const colWidths = [160, 110, 90, 80, 100, 80, 70];

    const headerY = 150;

    const headerHeight = drawTableHeader(
      doc,
      [
        "Resource Name",
        "Type",
        "Region",
        "Provider",
        "Account",
        "Monthly Cost",
        "Open Alerts",
      ],
      50,
      headerY,
      colWidths
    );

    let rowY = headerY + headerHeight;

    opts.resources.forEach((r, i) => {
      if (rowY > 520) {
        doc.addPage();

        drawHeader(
          doc,
          "Resource Inventory Report",
          opts.organizationId
        );

        rowY = 150;

        const continuedHeaderHeight = drawTableHeader(
          doc,
          [
            "Resource Name",
            "Type",
            "Region",
            "Provider",
            "Account",
            "Monthly Cost",
            "Open Alerts",
          ],
          50,
          rowY,
          colWidths
        );

        rowY += continuedHeaderHeight;
      }

      const rowHeight = drawTableRow(
        doc,
        [
          r.name,
          r.type,
          r.region ?? "—",
          r.provider,
          r.accountName,
          `$${r.monthlyCost.toFixed(2)}`,
          String(r.openAlerts),
        ],
        50,
        rowY,
        colWidths,
        i % 2 === 0
      );

      rowY += rowHeight;
    });

    doc.end();

    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}