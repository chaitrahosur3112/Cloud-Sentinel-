import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

// Parses and validates ?from=YYYY-MM-DD&to=YYYY-MM-DD query params.
// Defaults to last 30 days if omitted.
// Attaches parsed Date objects to res.locals so controllers don't re-parse.

export function validateDateRange(
  req: Request, res: Response, next: NextFunction
): void {
  try {
    const { from, to } = req.query;

    const fromDate = from
      ? new Date(String(from))
      : (() => { const d = new Date(); d.setDate(d.getDate() - 30); return d; })();

    const toDate = to ? new Date(String(to)) : new Date();

    if (isNaN(fromDate.getTime())) throw new AppError("from must be a valid date (YYYY-MM-DD)", 400);
    if (isNaN(toDate.getTime()))   throw new AppError("to must be a valid date (YYYY-MM-DD)", 400);
    if (fromDate >= toDate)        throw new AppError("from must be before to", 400);

    // Max range 365 days — prevents massively expensive queries
    const diffDays = (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > 365) throw new AppError("Date range cannot exceed 365 days", 400);

    // Attach to res.locals — a standard Express pattern for passing
    // data from middleware to the next handler without touching req.body
    res.locals.fromDate = fromDate;
    res.locals.toDate   = toDate;

    next();
  } catch (err) { next(err); }
}