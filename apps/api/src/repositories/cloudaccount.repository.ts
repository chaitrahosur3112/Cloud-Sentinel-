import { prisma } from "../config/prisma";
import { ConnectCloudAccountDto } from "../dtos/resource.dto";

export async function createCloudAccount(
  organizationId: string,
  dto: ConnectCloudAccountDto
) {
  return prisma.cloudAccount.create({
    data: {
      provider:       dto.provider as never,
      accountName:    dto.accountName,
      credentialsRef: dto.credentialsRef,
      organizationId,
    },
  });
}

export async function findCloudAccountsByOrg(organizationId: string) {
  return prisma.cloudAccount.findMany({
    where: { organizationId },
    include: { _count: { select: { resources: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function findCloudAccountById(id: string, organizationId: string) {
  return prisma.cloudAccount.findFirst({
    where: { id, organizationId }, // organizationId guard prevents cross-tenant access
  });
}

export async function deleteCloudAccount(id: string) {
  return prisma.cloudAccount.delete({ where: { id } });
}