// Unit tests for dashboard.service.ts
// Repository and cache are fully mocked — no DB, no Redis.

jest.mock("../src/repositories/dashboard.repository");
jest.mock("../src/utils/cache");

import * as repo    from "../src/repositories/dashboard.repository";
import * as cache   from "../src/utils/cache";
import * as service from "../src/services/dashboard.service";

const mockRepo  = repo  as jest.Mocked<typeof repo>;
const mockCache = cache as jest.Mocked<typeof cache>;

// Before each test: cache always misses so we always hit the repo
beforeEach(() => {
  mockCache.cacheGet.mockResolvedValue(null);
  mockCache.cacheSet.mockResolvedValue(undefined);
});

describe("DashboardService.getSummary", () => {
  it("returns correctly shaped summary from repo data", async () => {
    mockRepo.getMonthlyCostTotal.mockResolvedValue(12000);
    mockRepo.getWeeklyCostTotal.mockResolvedValue(3000);
    mockRepo.getDailyCostTotal.mockResolvedValue(450);
    mockRepo.getActiveResourceCount.mockResolvedValue(24);
    mockRepo.getUnusedResourceCount.mockResolvedValue(3);
    mockRepo.getTotalResourceCount.mockResolvedValue(27);
    mockRepo.getPotentialSavingsTotal.mockResolvedValue(1800);
    mockRepo.getBudgetsWithSpend.mockResolvedValue([
      { budget: { id: "b1", name: "Dev", scope: "ORGANIZATION", monthlyLimit: 10000 } as never, spent: 12000 }, // exceeded
      { budget: { id: "b2", name: "Prod", scope: "ORGANIZATION", monthlyLimit: 20000 } as never, spent: 8000 }, // ok
    ]);

    const result = await service.getSummary("org1");

    expect(result.costs.currentMonth).toBe(12000);
    expect(result.costs.today).toBe(450);
    expect(result.resources.active).toBe(24);
    expect(result.resources.unused).toBe(3);
    expect(result.savings.potential).toBe(1800);
    expect(result.budgets.total).toBe(2);
    expect(result.budgets.exceeded).toBe(1);   // only the Dev budget is exceeded
  });

  it("returns cached result without hitting the repo", async () => {
    const cachedSummary = { costs: { currentMonth: 999 } };
    mockCache.cacheGet.mockResolvedValueOnce(cachedSummary);

    const result = await service.getSummary("org1");

    expect(result).toEqual(cachedSummary);
    expect(mockRepo.getMonthlyCostTotal).not.toHaveBeenCalled();
  });
});

describe("DashboardService.getBudgetStatus", () => {
  it("correctly calculates percentUsed and isExceeded", async () => {
    mockRepo.getBudgetsWithSpend.mockResolvedValue([
      { budget: { id: "b1", name: "Engineering", scope: "DEPARTMENT", monthlyLimit: 5000 } as never, spent: 4000 },
    ]);

    const result = await service.getBudgetStatus("org1");

    expect(result[0].percentUsed).toBe(80);
    expect(result[0].remaining).toBe(1000);
    expect(result[0].isExceeded).toBe(false);
  });

  it("flags a budget as exceeded when spent > monthlyLimit", async () => {
    mockRepo.getBudgetsWithSpend.mockResolvedValue([
      { budget: { id: "b1", name: "QA", scope: "DEPARTMENT", monthlyLimit: 2000 } as never, spent: 2500 },
    ]);

    const result = await service.getBudgetStatus("org1");

    expect(result[0].isExceeded).toBe(true);
    expect(result[0].percentUsed).toBe(125);
    expect(result[0].remaining).toBe(-500);
  });
});

describe("DashboardService.getRecentAlerts", () => {
  it("formats createdAt as ISO string", async () => {
    const date = new Date("2026-07-01T10:00:00Z");
    mockRepo.getRecentAlerts.mockResolvedValue([
      { id: "a1", type: "COST_SPIKE", status: "OPEN", message: "Spike detected",
        createdAt: date, resourceId: "r1", budgetId: null },
    ] as never);

    const result = await service.getRecentAlerts("org1");

    expect(result[0].createdAt).toBe("2026-07-01T10:00:00.000Z");
    expect(result[0].type).toBe("COST_SPIKE");
  });
});