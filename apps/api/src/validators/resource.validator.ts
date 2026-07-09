// Validators for cloud account creation and resource list query params.
// Note: query params from URLs are always strings — "20" not 20.
// We coerce page/limit to numbers here before they reach the service.

import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

const VALID_PROVIDERS  = ["AWS", "AZURE", "GCP"];
const VALID_TYPES      = [
  "VIRTUAL_MACHINE", "DATABASE", "STORAGE_BUCKET",
  "LOAD_BALANCER", "KUBERNETES_CLUSTER", "SERVERLESS_FUNCTION",
];

export function validateConnectCloudAccount(
  req: Request, _res: Response, next: NextFunction
): void {
  try {
    const { provider, accountName, credentialsRef } = req.body;

    if (!provider || !VALID_PROVIDERS.includes(provider)) {
      throw new AppError(`provider must be one of: ${VALID_PROVIDERS.join(", ")}`, 400);
    }
    if (!accountName || String(accountName).trim() === "") {
      throw new AppError("accountName is required", 400);
    }
    if (!credentialsRef || String(credentialsRef).trim() === "") {
      throw new AppError("credentialsRef is required", 400);
    }
    next();
  } catch (err) { next(err); }
}

export function validateResourceQuery(
  req: Request, _res: Response, next: NextFunction
): void {
  try {
    const { type, provider, page, limit } = req.query;

    if (type && !VALID_TYPES.includes(String(type))) {
      throw new AppError(`type must be one of: ${VALID_TYPES.join(", ")}`, 400);
    }
    if (provider && !VALID_PROVIDERS.includes(String(provider))) {
      throw new AppError(`provider must be one of: ${VALID_PROVIDERS.join(", ")}`, 400);
    }

    // Coerce and validate pagination — query params arrive as strings
    const pageNum  = page  ? parseInt(String(page),  10) : 1;
    const limitNum = limit ? parseInt(String(limit), 10) : 20;

    if (isNaN(pageNum)  || pageNum  < 1)  throw new AppError("page must be a positive integer", 400);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new AppError("limit must be between 1 and 100", 400);
    }

    // Attach parsed numbers back so the controller doesn't re-parse them
    req.query.page  = String(pageNum);
    req.query.limit = String(limitNum);

    next();
  } catch (err) { next(err); }
}