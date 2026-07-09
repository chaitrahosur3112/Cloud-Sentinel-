import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export function authorize(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) { next(new AppError("Not authenticated", 401)); return; }
    if (!allowedRoles.includes(req.user.role as string)) {
      next(new AppError(`Access denied. Required role: ${allowedRoles.join(" or ")}`, 403)); return;
    }
    next();
  };
}