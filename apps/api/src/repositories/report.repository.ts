import { prisma } from "../config/prisma";

// ---------- Save and retrieve report records ----------

export async function createReportRecord(opts: {
  organizationId: string;
  generatedById:  string;
  format:         string;
  fileUrl:        string;
}) {
  return prisma.report.create({ data: opts });
}

export async function findReportsByOrg(organizationId: string) {
  return prisma.report.findMany({
    where:   { organizationId },
    orderBy: { createdAt: "desc" },
    include: {
      generatedBy: { select: { firstName: true, lastName: true, email: true } },
    },
  });
}

export async function findReportById(id: string, organizationId: string) {
  return prisma.report.findFirst({
    where: { id, organizationId },
  });
}

// ---------- Data queries for report content ----------

// Cost summary data — monthly totals + budget status
export async function getCostSummaryData(organizationId: string, from: Date, to: Date) {
  const [budgets, costRecords] = await Promise.all([
    prisma.budget.findMany({ where: { organizationId } }),
    prisma.costRecord.findMany({
      where: {
        date:     { gte: from, lte: to },
        resource: { cloudAccount: { organizationId } },
      },
      include: {
        resource: {
          select: {
            name: true, type: true,
            cloudAccount: { select: { provider: true, accountName: true } },
          },
        },
      },
      orderBy: { date: "asc" },
    }),
  ]);

  return { budgets, costRecords };
}

// Resource inventory — all resources with current month cost
export async function getResourceInventoryData(organizationId: string) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  return prisma.resource.findMany({
    where: { cloudAccount: { organizationId } },
    include: {
      cloudAccount: { select: { provider: true, accountName: true } },
      costRecords:  {
        where:  { date: { gte: startOfMonth } },
        select: { amount: true },
      },
      alerts: {
        where:  { status: "OPEN" },
        select: { type: true },
      },
    },
    orderBy: { name: "asc" },
  });
}