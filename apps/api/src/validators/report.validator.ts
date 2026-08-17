import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

const VALID_FORMATS = ["PDF", "EXCEL", "CSV"];
const VALID_TYPES   = ["COST_SUMMARY", "RESOURCE_INVENTORY", "ANOMALY_REPORT"];

export function validateGenerateReport(
  req: Request, _res: Response, next: NextFunction
): void {
  try {
    const { type, format, from, to } = req.body as Record<string, string>;

    if (!type || !VALID_TYPES.includes(type)) {
      throw new AppError(`type must be one of: ${VALID_TYPES.join(", ")}`, 400);
    }
    if (!format || !VALID_FORMATS.includes(format)) {
      throw new AppError(`format must be one of: ${VALID_FORMATS.join(", ")}`, 400);
    }
    if (from && isNaN(new Date(from).getTime())) {
      throw new AppError("from must be a valid date (YYYY-MM-DD)", 400);
    }
    if (to && isNaN(new Date(to).getTime())) {
      throw new AppError("to must be a valid date (YYYY-MM-DD)", 400);
    }

    next();
  } catch (err) { next(err); }
}