import { prisma } from "../config/prisma";
import { redis } from "../config/redis";

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email }, include: { organization: true } });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id }, include: { organization: true } });
}

export async function createOrganizationAndAdmin(opts: {
  organizationName: string; firstName: string;
  lastName: string; email: string; passwordHash: string;
}) {
  // $transaction means: if the user insert fails, the org creation is rolled back too
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return prisma.$transaction(async (tx: any) => {
    const organization = await tx.organization.create({ data: { name: opts.organizationName } });
    const user = await tx.user.create({
      data: {
        firstName: opts.firstName, lastName: opts.lastName,
        email: opts.email, passwordHash: opts.passwordHash,
        role: "ORG_ADMIN" as never, organizationId: organization.id,
      },
    });
    return { organization, user };
  });
}

export async function markEmailVerified(userId: string) {
  return prisma.user.update({ where: { id: userId }, data: { isEmailVerified: true } });
}

export async function updatePasswordHash(userId: string, passwordHash: string) {
  return prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}

export async function saveRefreshToken(opts: { tokenHash: string; userId: string; expiresAt: Date }) {
  return prisma.refreshToken.create({ data: opts });
}

export async function findRefreshToken(tokenHash: string) {
  return prisma.refreshToken.findUnique({ where: { tokenHash } });
}

export async function revokeRefreshToken(tokenHash: string) {
  return prisma.refreshToken.update({ where: { tokenHash }, data: { revoked: true } });
}

export async function revokeAllUserRefreshTokens(userId: string) {
  return prisma.refreshToken.updateMany({ where: { userId, revoked: false }, data: { revoked: true } });
}

// --- Redis: short-lived one-time tokens (auto-expire after 1 hour) ---
const EMAIL_VERIFY_PREFIX = "email_verify:";
const PASSWORD_RESET_PREFIX = "password_reset:";
const TOKEN_TTL_SECONDS = 60 * 60;

export async function saveEmailVerifyToken(userId: string, token: string): Promise<void> {
  await redis.set(`${EMAIL_VERIFY_PREFIX}${token}`, userId, "EX", TOKEN_TTL_SECONDS);
}
export async function consumeEmailVerifyToken(token: string): Promise<string | null> {
  const key = `${EMAIL_VERIFY_PREFIX}${token}`;
  const userId = await redis.get(key);
  if (userId) await redis.del(key);
  return userId;
}
export async function savePasswordResetToken(userId: string, token: string): Promise<void> {
  await redis.set(`${PASSWORD_RESET_PREFIX}${token}`, userId, "EX", TOKEN_TTL_SECONDS);
}
export async function consumePasswordResetToken(token: string): Promise<string | null> {
  const key = `${PASSWORD_RESET_PREFIX}${token}`;
  const userId = await redis.get(key);
  if (userId) await redis.del(key);
  return userId;
}