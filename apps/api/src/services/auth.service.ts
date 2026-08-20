import bcrypt from "bcryptjs";
import crypto from "crypto";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../config/jwt";
import { sendEmail } from "../config/email";
import { AppError } from "../utils/AppError";
import * as repo from "../repositories/auth.repository";
import { RegisterDto, LoginDto } from "../dtos/auth.dto";

const BCRYPT_ROUNDS = 12;

function hashToken(token: string): string {
  // Store hash of refresh token, not the raw value — so a DB leak is useless to attackers
  return crypto.createHash("sha256").update(token).digest("hex");
}

function refreshTokenExpiryDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date;
}

export async function register(dto: RegisterDto) {
  const existing = await repo.findUserByEmail(dto.email);
  if (existing) throw new AppError("An account with this email already exists", 409);

  const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
  const { user, organization } = await repo.createOrganizationAndAdmin({ ...dto, passwordHash });

  const verifyToken = crypto.randomUUID();
  await repo.saveEmailVerifyToken(user.id, verifyToken);

  const verifyUrl =
  `${process.env.API_URL}/api/v1/auth/verify-email?token=${verifyToken}`;
  await sendEmail({
    to: user.email, subject: "Verify your CloudCost Sentinel account",
    html: `<h2>Welcome, ${user.firstName}!</h2><p>Verify your email: <a href="${verifyUrl}">Click here</a>. Expires in 1 hour.</p>`,
  });

  return { message: "Registration successful. Please check your email.", organizationId: organization.id, userId: user.id };
}

export async function verifyEmail(token: string) {
  const userId = await repo.consumeEmailVerifyToken(token);
  if (!userId) throw new AppError("Invalid or expired verification token", 400);
  await repo.markEmailVerified(userId);
  return { message: "Email verified successfully. You can now log in." };
}

export async function login(dto: LoginDto) {
  const user = await repo.findUserByEmail(dto.email);

  // Run bcrypt even when user doesn't exist — prevents timing attacks
  const dummyHash = "$2b$12$invalidhashfortimingattackprevention00000000000000000";
  const passwordMatch = user
    ? await bcrypt.compare(dto.password, user.passwordHash)
    : await bcrypt.compare(dto.password, dummyHash).then(() => false);

  if (!user || !passwordMatch) throw new AppError("Invalid email or password", 401);
  if (!user.isEmailVerified) throw new AppError("Please verify your email address before logging in", 403);

  const accessToken = signAccessToken({ userId: user.id, organizationId: user.organizationId, role: user.role });
  const rawRefreshToken = signRefreshToken({ userId: user.id });

  await repo.saveRefreshToken({ tokenHash: hashToken(rawRefreshToken), userId: user.id, expiresAt: refreshTokenExpiryDate() });

  return {
    accessToken, refreshToken: rawRefreshToken,
    user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, organizationId: user.organizationId },
  };
}

export async function refresh(rawRefreshToken: string) {
  let payload: { userId: string };
  try { payload = verifyRefreshToken(rawRefreshToken); }
  catch { throw new AppError("Invalid or expired refresh token", 401); }

  const tokenHash = hashToken(rawRefreshToken);
  const stored = await repo.findRefreshToken(tokenHash);
  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw new AppError("Refresh token is invalid or has been revoked", 401);
  }

  // Token rotation: old token revoked, new token issued on every refresh
  await repo.revokeRefreshToken(tokenHash);
  const user = await repo.findUserById(payload.userId);
  if (!user) throw new AppError("User not found", 404);

  const newAccessToken = signAccessToken({ userId: user.id, organizationId: user.organizationId, role: user.role });
  const newRawRefreshToken = signRefreshToken({ userId: user.id });
  await repo.saveRefreshToken({ tokenHash: hashToken(newRawRefreshToken), userId: user.id, expiresAt: refreshTokenExpiryDate() });

  return { accessToken: newAccessToken, refreshToken: newRawRefreshToken };
}

export async function logout(rawRefreshToken: string) {
  await repo.revokeRefreshToken(hashToken(rawRefreshToken)).catch(() => {});
  return { message: "Logged out successfully" };
}

export async function forgotPassword(email: string) {
  const genericMessage = "If an account with that email exists, a password reset link has been sent.";
  const user = await repo.findUserByEmail(email);
  if (!user) return { message: genericMessage }; // never leak whether email exists

  const resetToken = crypto.randomUUID();
  await repo.savePasswordResetToken(user.id, resetToken);

  const resetUrl = `${process.env.FRONTEND_URL ?? "http://localhost:3000"}/reset-password?token=${resetToken}`;
  await sendEmail({
    to: user.email, subject: "Reset your CloudCost Sentinel password",
    html: `<h2>Password Reset</h2><p><a href="${resetUrl}">Reset Password</a> — expires in 1 hour.</p>`,
  });
  return { message: genericMessage };
}

export async function resetPassword(token: string, newPassword: string) {
  const userId = await repo.consumePasswordResetToken(token);
  if (!userId) throw new AppError("Invalid or expired reset token", 400);

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await repo.updatePasswordHash(userId, passwordHash);
  await repo.revokeAllUserRefreshTokens(userId); // force logout all sessions
  return { message: "Password reset successful. Please log in with your new password." };
}