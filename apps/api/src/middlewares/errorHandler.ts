import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";
import { env } from "../config/env";

// Express recognizes this as an error handler specifically because it takes
// 4 arguments. Any time a controller calls next(err), or throws inside an
// async route wrapped correctly, execution lands here — one place to decide
// what the client sees, instead of repeating try/catch everywhere.

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;

  if (!isAppError || statusCode >= 500) {
    logger.error(err.stack ?? err.message);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || "Internal server error",
      // Stack traces are useful for you locally, dangerous to leak in prod.
      ...(env.isProduction ? {} : { stack: err.stack }),
    },
  });
}
