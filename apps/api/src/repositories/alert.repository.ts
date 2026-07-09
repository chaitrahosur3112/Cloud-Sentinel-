import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";
import { AlertFilter } from "../dtos/alert.dto";

export async function findAlerts(filter: AlertFilter) {
  const where: Prisma.AlertWhereInput = {
    // Alerts belong to an org via resource OR via budget
    OR: [
      { resource: { cloudAccount: { organizationId: filter.organizationId } } },
      { budget:   { organizationId: filter.organizationId } },
    ],
    ...(filter.type   ? { type:   filter.type   as never } : {}),
    ...(filter.status ? { status: filter.status as never } : {}),
  };

  const skip = (filter.page - 1) * filter.limit;

  const [total, alerts] = await Promise.all([
    prisma.alert.count({ where }),
    prisma.alert.findMany({
      where,
      skip,
      take:    filter.limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, type: true, status: true, message: true,
        createdAt: true, resolvedAt: true,
        resourceId: true, budgetId: true,
      },
    }),
  ]);

  return { total, alerts };
}

export async function findAlertById(id: string) {
  return prisma.alert.findUnique({ where: { id } });
}

export async function acknowledgeAlert(id: string) {
  return prisma.alert.update({
    where: { id },
    data:  { status: "ACKNOWLEDGED" as never },
  });
}

export async function resolveAlert(id: string) {
  return prisma.alert.update({
    where: { id },
    data:  { status: "RESOLVED" as never, resolvedAt: new Date() },
  });
}