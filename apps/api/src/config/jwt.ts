import jwt from "jsonwebtoken";
import { env } from "./env";

// This file only knows how to sign and verify tokens. It does NOT know
// about login, passwords, or routes — that separation matters: in Phase 3
// the auth service will import these functions instead of calling
// jsonwebtoken directly, so token logic lives in exactly one place.

export interface AccessTokenPayload {
  userId: string;
  organizationId: string;
  role: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const options: jwt.SignOptions = {
    expiresIn: env.accessTokenExpiresIn as jwt.SignOptions["expiresIn"],
  };
  return jwt.sign(payload, env.accessTokenSecret, options);
}

export function signRefreshToken(payload: { userId: string }): string {
  const options: jwt.SignOptions = {
    expiresIn: env.refreshTokenExpiresIn as jwt.SignOptions["expiresIn"],
  };
  return jwt.sign(payload, env.refreshTokenSecret, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.accessTokenSecret) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): { userId: string } {
  return jwt.verify(token, env.refreshTokenSecret) as { userId: string };
}
