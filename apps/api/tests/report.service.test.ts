jest.mock("../src/repositories/report.repository", () => ({
  createReportRecord: jest.fn(),
  findReportsByOrg: jest.fn(),
  findReportById: jest.fn(),
  getCostSummaryData: jest.fn(),
  getResourceInventoryData: jest.fn(),
}));

jest.mock("../src/utils/fileStorage", () => ({
  ensureReportsDir: jest.fn(),
  buildFilename: jest.fn(),
  getReportPath: jest.fn(),
  getReportUrl: jest.fn(),
}));

jest.mock("../src/services/generators/pdfGenerator", () => ({
  generateCostSummaryPDF: jest.fn(),
  generateResourceInventoryPDF: jest.fn(),
}));

jest.mock("../src/services/generators/excelGenerator", () => ({
  generateCostSummaryExcel: jest.fn(),
  generateResourceInventoryExcel: jest.fn(),
}));

jest.mock("../src/services/generators/csvGenerator", () => ({
  generateCostSummaryCSV: jest.fn(),
  generateResourceInventoryCSV: jest.fn(),
}));

import * as repo from "../src/repositories/report.repository";
import * as fileStorage from "../src/utils/fileStorage";
import * as pdfGen from "../src/services/generators/pdfGenerator";
import * as service from "../src/services/report.service";
import { AppError } from "../src/utils/AppError";

const mockRepo = repo as jest.Mocked<typeof repo>;
const mockStorage = fileStorage as jest.Mocked<typeof fileStorage>;
const mockPdf = pdfGen as jest.Mocked<typeof pdfGen>;

beforeEach(() => {
  mockStorage.ensureReportsDir.mockReturnValue(undefined);
  mockStorage.buildFilename.mockReturnValue("test_report.pdf");
  mockStorage.getReportPath.mockReturnValue("/tmp/test_report.pdf");
  mockStorage.getReportUrl.mockReturnValue(
    "/uploads/reports/test_report.pdf"
  );
});

describe("ReportService.generateReport - COST_SUMMARY PDF", () => {
  it("calls pdfGenerator and saves a DB record", async () => {
    mockRepo.getCostSummaryData.mockResolvedValueOnce({
      budgets: [
        {
          id: "b1",
          name: "Dev",
          scope: "DEPARTMENT",
          monthlyLimit: { toString: () => "5000" } as never,
          organizationId: "org1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      costRecords: [
        {
          date: new Date("2026-06-15"),
          amount: { toString: () => "123.45" } as never,
          resource: {
            name: "prod-vm",
            type: "VIRTUAL_MACHINE",
            cloudAccount: {
              provider: "AWS",
              accountName: "Acme AWS",
            },
          },
        },
      ] as never,
    });

    mockPdf.generateCostSummaryPDF.mockResolvedValueOnce(undefined);

    mockRepo.createReportRecord.mockResolvedValueOnce({
      id: "rep1",
      format: "PDF",
      fileUrl: "/uploads/reports/test_report.pdf",
      createdAt: new Date(),
      generatedById: "u1",
      organizationId: "org1",
    } as never);

    const result = await service.generateReport("org1", "u1", {
      type: "COST_SUMMARY",
      format: "PDF",
    });

    expect(mockPdf.generateCostSummaryPDF).toHaveBeenCalled();

    expect(mockRepo.createReportRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org1",
        format: "PDF",
      })
    );

    expect(result.format).toBe("PDF");
  });
});

describe("ReportService.downloadReport", () => {
  it("throws 404 when report not found in DB", async () => {
    mockRepo.findReportById.mockResolvedValueOnce(null);

    await expect(
      service.downloadReport("bad-id", "org1")
    ).rejects.toThrow(new AppError("Report not found", 404));
  });
});