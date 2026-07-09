import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

function requireField(body: Record<string, unknown>, field: string): void {
  const value = body[field];
  if (value === undefined || value === null || String(value).trim() === "") {
    throw new AppError(`${field} is required`, 400);
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password: string): boolean {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

export function validateRegister(req: Request, _res: Response, next: NextFunction): void {
  try {
    const body = req.body as Record<string, unknown>;
    requireField(body, "organizationName");
    requireField(body, "firstName");
    requireField(body, "lastName");
    requireField(body, "email");
    requireField(body, "password");
    if (!isValidEmail(String(body.email))) throw new AppError("Invalid email address", 400);
    if (!isStrongPassword(String(body.password))) {
      throw new AppError("Password must be at least 8 characters and include uppercase, lowercase, and a number", 400);
    }
    next();
  } catch (err) { next(err); }
}

export function validateLogin(req: Request, _res: Response, next: NextFunction): void {
  try {
    const body = req.body as Record<string, unknown>;
    requireField(body, "email");
    requireField(body, "password");
    next();
  } catch (err) { next(err); }
}

export function validateForgotPassword(req: Request, _res: Response, next: NextFunction): void {
  try {
    const body = req.body as Record<string, unknown>;
    requireField(body, "email");
    if (!isValidEmail(String(body.email))) throw new AppError("Invalid email address", 400);
    next();
  } catch (err) { next(err); }
}

export function validateResetPassword(req: Request, _res: Response, next: NextFunction): void {
  try {
    const body = req.body as Record<string, unknown>;
    requireField(body, "token");
    requireField(body, "newPassword");
    if (!isStrongPassword(String(body.newPassword))) {
      throw new AppError("Password must be at least 8 characters and include uppercase, lowercase, and a number", 400);
    }
    next();
  } catch (err) { next(err); }
}