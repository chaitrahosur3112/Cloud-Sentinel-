import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../config/jwt";
import { AppError } from "../utils/AppError";

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    console.log("Authorization Header:", authHeader);

    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError("No access token provided", 401);
    }

    const token = authHeader.slice(7);

    console.log("Received Token:", token);

    const payload = verifyAccessToken(token);

    console.log("Decoded Payload:", payload);

    req.user = {
      userId: payload.userId,
      organizationId: payload.organizationId,
      role: payload.role as never,
    };

    next();
  } catch (err) {
    console.error("JWT ERROR:", err);
    next(err instanceof AppError ? err : new AppError("Invalid or expired access token", 401));
  }
}