import * as repo from "../repositories/budget.repository";
import { cacheBust } from "../utils/cache";
import { CreateBudgetDto, UpdateBudgetDto, BudgetResponse } from "../dtos/budget.dto";
import { AppError } from "../utils/AppError";

// Helper — formats a Prisma budget row into the response shape
function formatBudget(b: {
  id: string; name: string; scope: string;
  monthlyLimit: { toString(): string };
  organizationId: string; createdAt: Date; updatedAt: Date;
}): BudgetResponse {
  return {
    id:             b.id,
    name:           b.name,
    scope:          b.scope,
    monthlyLimit:   Number(b.monthlyLimit),
    organizationId: b.organizationId,
    createdAt:      b.createdAt.toISOString(),
    updatedAt:      b.updatedAt.toISOString(),
  };
}

export async function createBudget(organizationId: string, dto: CreateBudgetDto) {
  const budget = await repo.createBudget(organizationId, dto);
  await cacheBust(`dashboard:*:${organizationId}`);
  return formatBudget(budget);
}

export async function listBudgets(organizationId: string) {
  const budgets = await repo.findBudgetsByOrg(organizationId);
  return budgets.map(formatBudget);
}

export async function getBudget(id: string, organizationId: string) {
  const budget = await repo.findBudgetById(id, organizationId);
  if (!budget) throw new AppError("Budget not found", 404);
  return formatBudget(budget);
}

export async function updateBudget(id: string, organizationId: string, dto: UpdateBudgetDto) {
  const existing = await repo.findBudgetById(id, organizationId);
  if (!existing) throw new AppError("Budget not found", 404);

  const updated = await repo.updateBudget(id, dto);
  await cacheBust(`dashboard:*:${organizationId}`);
  return formatBudget(updated);
}

export async function deleteBudget(id: string, organizationId: string) {
  const existing = await repo.findBudgetById(id, organizationId);
  if (!existing) throw new AppError("Budget not found", 404);

  await repo.deleteBudget(id);
  await cacheBust(`dashboard:*:${organizationId}`);
  return { message: "Budget deleted successfully" };
}