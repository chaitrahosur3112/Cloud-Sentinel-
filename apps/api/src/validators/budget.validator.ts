import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

const VALID_SCOPES = ["ORGANIZATION", "DEPARTMENT", "CLOUD_ACCOUNT"];

function validateBudgetBody(body: Record<string, unknown>): void {
  const { name, scope, monthlyLimit } = body;

  if (!name || String(name).trim() === "") {
    throw new AppError("name is required", 400);
  }
  if (!scope || !VALID_SCOPES.includes(String(scope))) {
    throw new AppError(`scope must be one of: ${VALID_SCOPES.join(", ")}`, 400);
  }
  const limit = Number(monthlyLimit);
  if (!monthlyLimit || isNaN(limit) || limit <= 0) {
    throw new AppError("monthlyLimit must be a positive number", 400);
  }
}

export function validateCreateBudget(
  req: Request, _res: Response, next: NextFunction
): void {
  try {
    validateBudgetBody(req.body as Record<string, unknown>);
    next();
  } catch (err) { next(err); }
}

export function validateUpdateBudget(
  req: Request, _res: Response, next: NextFunction
): void {
  try {
    validateBudgetBody(req.body as Record<string, unknown>);
    next();
  } catch (err) { next(err); }
}