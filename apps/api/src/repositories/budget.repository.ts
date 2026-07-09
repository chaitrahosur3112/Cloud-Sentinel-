import { prisma } from "../config/prisma";
import { CreateBudgetDto, UpdateBudgetDto } from "../dtos/budget.dto";

export async function createBudget(organizationId: string, dto: CreateBudgetDto) {
  return prisma.budget.create({
    data: {
      name:         dto.name,
      scope:        dto.scope as never,
      monthlyLimit: dto.monthlyLimit,
      organizationId,
    },
  });
}

export async function findBudgetsByOrg(organizationId: string) {
  return prisma.budget.findMany({
    where:   { organizationId },
    orderBy: { createdAt: "desc" },
  });
}

export async function findBudgetById(id: string, organizationId: string) {
  // Always include organizationId in the where clause —
  // prevents a user from reading another org's budget by guessing an ID.
  return prisma.budget.findFirst({ where: { id, organizationId } });
}

export async function updateBudget(id: string, dto: UpdateBudgetDto) {
  return prisma.budget.update({
    where: { id },
    data: {
      name:         dto.name,
      scope:        dto.scope as never,
      monthlyLimit: dto.monthlyLimit,
    },
  });
}

export async function deleteBudget(id: string) {
  return prisma.budget.delete({ where: { id } });
}