// Run with: npx ts-node prisma/seed.ts
// Requires the database to be running and migrations to have been applied.

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ---------- Org + Admin ----------
  const org = await prisma.organization.upsert({
    where:  { id: "seed-org-1" },
    update: {},
    create: { id: "seed-org-1", name: "Acme Corp" },
  });

  const passwordHash = await bcrypt.hash("Password1", 12);

  const admin = await prisma.user.upsert({
    where:  { email: "admin@acme.com" },
    update: {},
    create: {
      email: "admin@acme.com", passwordHash,
      firstName: "Jane", lastName: "Doe",
      role: "ORG_ADMIN", isEmailVerified: true,
      organizationId: org.id,
    },
  });

  console.log(`✓ Org: ${org.name} | Admin: ${admin.email}`);

  // ---------- Cloud Accounts ----------
  const awsAccount = await prisma.cloudAccount.upsert({
    where:  { id: "seed-ca-aws" },
    update: {},
    create: {
      id: "seed-ca-aws", provider: "AWS",
      accountName: "Acme Production AWS",
      credentialsRef: "arn:aws:iam::123456789012:role/CloudCostReader",
      organizationId: org.id,
    },
  });

  const azureAccount = await prisma.cloudAccount.upsert({
    where:  { id: "seed-ca-azure" },
    update: {},
    create: {
      id: "seed-ca-azure", provider: "AZURE",
      accountName: "Acme Azure Subscription",
      credentialsRef: "azure://subscriptions/abc-123-def",
      organizationId: org.id,
    },
  });

  console.log("✓ Cloud accounts: AWS + Azure");

  // ---------- Resources ----------
  const resourceDefs = [
    { id: "seed-r-1", name: "prod-web-server-01", type: "VIRTUAL_MACHINE",       region: "us-east-1",    accountId: awsAccount.id,   baseCost: 120 },
    { id: "seed-r-2", name: "prod-postgres-main",  type: "DATABASE",              region: "us-east-1",    accountId: awsAccount.id,   baseCost: 280 },
    { id: "seed-r-3", name: "prod-assets-bucket",  type: "STORAGE_BUCKET",        region: "us-west-2",    accountId: awsAccount.id,   baseCost: 45  },
    { id: "seed-r-4", name: "prod-alb-main",        type: "LOAD_BALANCER",         region: "us-east-1",    accountId: awsAccount.id,   baseCost: 30  },
    { id: "seed-r-5", name: "prod-k8s-cluster",     type: "KUBERNETES_CLUSTER",    region: "eu-west-1",    accountId: azureAccount.id, baseCost: 600 },
    { id: "seed-r-6", name: "image-resizer-fn",     type: "SERVERLESS_FUNCTION",   region: "eu-west-1",    accountId: azureAccount.id, baseCost: 8   },
    { id: "seed-r-7", name: "dev-vm-unused",         type: "VIRTUAL_MACHINE",       region: "us-east-1",    accountId: awsAccount.id,   baseCost: 60  },
  ];

  for (const def of resourceDefs) {
    await prisma.resource.upsert({
      where:  { id: def.id },
      update: {},
      create: {
        id: def.id, name: def.name, type: def.type as never,
        region: def.region, externalId: `ext-${def.id}`,
        cloudAccountId: def.accountId,
      },
    });
  }

  console.log(`✓ ${resourceDefs.length} resources created`);

  // ---------- Cost Records (90 days) ----------
  // Generate daily cost records for each resource for the last 90 days.
  // Add a bit of random variance so the charts look realistic.

  const costInserts: Array<{
    resourceId: string; date: Date; amount: number; currency: string;
  }> = [];

  for (const def of resourceDefs) {
    for (let daysBack = 90; daysBack >= 0; daysBack--) {
      const date = new Date();
      date.setDate(date.getDate() - daysBack);
      date.setHours(0, 0, 0, 0);

      // Daily cost = monthly base / 30 + up to 15% random variance
      const dailyBase  = def.baseCost / 30;
      const variance   = dailyBase * (Math.random() * 0.3 - 0.15);
      const amount     = Math.max(0, dailyBase + variance);

      costInserts.push({
        resourceId: def.id,
        date,
        amount: parseFloat(amount.toFixed(4)),
        currency: "USD",
      });
    }
  }

  // createMany is much faster than individual creates in a loop
  await prisma.costRecord.createMany({ data: costInserts, skipDuplicates: true });
  console.log(`✓ ${costInserts.length} cost records inserted`);

  // ---------- Budgets ----------
  await prisma.budget.createMany({
    skipDuplicates: true,
    data: [
      { id: "seed-b-1", name: "Monthly AWS Budget",   scope: "ORGANIZATION", monthlyLimit: 2000, organizationId: org.id },
      { id: "seed-b-2", name: "K8s Cluster Budget",   scope: "DEPARTMENT",   monthlyLimit: 700,  organizationId: org.id },
      { id: "seed-b-3", name: "Dev Environment",      scope: "DEPARTMENT",   monthlyLimit: 300,  organizationId: org.id },
    ],
  });

  console.log("✓ 3 budgets created");

  // ---------- Alerts ----------
  await prisma.alert.createMany({
    skipDuplicates: true,
    data: [
      {
        id: "seed-a-1", type: "IDLE_RESOURCE", status: "OPEN",
        message: "dev-vm-unused has had no traffic for 14 days",
        resourceId: "seed-r-7",
      },
      {
        id: "seed-a-2", type: "BUDGET_EXCEEDED", status: "OPEN",
        message: "Monthly AWS Budget is at 105% utilization",
        budgetId: "seed-b-1",
      },
    ],
  });

  console.log("✓ 2 alerts created");

  // ---------- Recommendations ----------
  await prisma.recommendation.createMany({
    skipDuplicates: true,
    data: [
      {
        id: "seed-rec-1", resourceId: "seed-r-7",
        description: "dev-vm-unused has been idle for 14 days. Consider stopping or terminating it.",
        estimatedSavings: 60,
      },
      {
        id: "seed-rec-2", resourceId: "seed-r-1",
        description: "prod-web-server-01 is running at <10% CPU. Downgrade from t3.large to t3.small.",
        estimatedSavings: 42,
      },
    ],
  });

  console.log("✓ 2 recommendations created");
  console.log("\n✅ Seed complete.");
  console.log(`   Login: admin@acme.com / Password1`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());