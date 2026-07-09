import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as authService from "../services/auth.service";
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from "../dtos/auth.dto";

const REFRESH_COOKIE = "refreshToken";

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,                                          // JS in browser cannot read it
    secure: process.env.NODE_ENV === "production",          // HTTPS only in prod
    sameSite: "strict",                                     // blocks CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body as RegisterDto);
  res.status(201).json({ success: true, data: result });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.query as { token: string };
  if (!token) { res.status(400).json({ success: false, error: { message: "Token is required" } }); return; }
  const result = await authService.verifyEmail(token);
  res.status(200).json({ success: true, data: result });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { accessToken, refreshToken, user } = await authService.login(req.body as LoginDto);
  setRefreshCookie(res, refreshToken);
  res.status(200).json({ success: true, data: { accessToken, user } });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const rawRefreshToken = req.cookies?.[REFRESH_COOKIE] as string | undefined;
  if (!rawRefreshToken) { res.status(401).json({ success: false, error: { message: "No refresh token provided" } }); return; }
  const { accessToken, refreshToken: newRefreshToken } = await authService.refresh(rawRefreshToken);
  setRefreshCookie(res, newRefreshToken);
  res.status(200).json({ success: true, data: { accessToken } });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const rawRefreshToken = req.cookies?.[REFRESH_COOKIE] as string | undefined;
  if (rawRefreshToken) await authService.logout(rawRefreshToken);
  res.clearCookie(REFRESH_COOKIE);
  res.status(200).json({ success: true, data: { message: "Logged out successfully" } });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.forgotPassword((req.body as ForgotPasswordDto).email);
  res.status(200).json({ success: true, data: result });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body as ResetPasswordDto;
  const result = await authService.resetPassword(token, newPassword);
  res.status(200).json({ success: true, data: result });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: { user: req.user } });
});