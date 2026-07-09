import * as repo from "../repositories/cloudaccount.repository";
import { cacheBust } from "../utils/cache";
import { ConnectCloudAccountDto } from "../dtos/resource.dto";
import { AppError } from "../utils/AppError";

export async function connectAccount(organizationId: string, dto: ConnectCloudAccountDto) {
  const account = await repo.createCloudAccount(organizationId, dto);

  // Bust the dashboard cache — a new account means new resources will appear
  await cacheBust(`dashboard:*:${organizationId}`);

  return {
    id:          account.id,
    provider:    account.provider,
    accountName: account.accountName,
    createdAt:   account.createdAt.toISOString(),
  };
}

export async function listAccounts(organizationId: string) {
  const accounts = await repo.findCloudAccountsByOrg(organizationId);
  return accounts.map((a) => ({
    id:            a.id,
    provider:      a.provider,
    accountName:   a.accountName,
    resourceCount: a._count.resources,
    createdAt:     a.createdAt.toISOString(),
  }));
}

export async function disconnectAccount(id: string, organizationId: string) {
  const account = await repo.findCloudAccountById(id, organizationId);
  if (!account) throw new AppError("Cloud account not found", 404);

  await repo.deleteCloudAccount(id);
  await cacheBust(`dashboard:*:${organizationId}`);

  return { message: "Cloud account disconnected successfully" };
}