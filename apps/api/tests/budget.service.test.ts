jest.mock("../src/repositories/budget.repository");
jest.mock("../src/utils/cache");

import * as repo    from "../src/repositories/budget.repository";
import * as cache   from "../src/utils/cache";
import * as service from "../src/services/budget.service";
import { AppError } from "../src/utils/AppError";

const mockRepo  = repo  as jest.Mocked<typeof repo>;
const mockCache = cache as jest.Mocked<typeof cache>;

beforeEach(() => { mockCache.cacheBust.mockResolvedValue(undefined); });

const fakeBudget = {
  id: "b1", name: "Dev", scope: "DEPARTMENT",
  monthlyLimit: { toString: () => "5000" },
  organizationId: "org1",
  createdAt: new Date("2026-01-01"), updatedAt: new Date("2026-01-01"),
};

describe("BudgetService.createBudget", () => {
  it("returns formatted budget on success", async () => {
    mockRepo.createBudget.mockResolvedValueOnce(fakeBudget as never);
    const result = await service.createBudget("org1", { name: "Dev", scope: "DEPARTMENT", monthlyLimit: 5000 });
    expect(result.name).toBe("Dev");
    expect(result.monthlyLimit).toBe(5000);
    expect(mockCache.cacheBust).toHaveBeenCalledWith("dashboard:*:org1");
  });
});

describe("BudgetService.getBudget", () => {
  it("throws 404 when budget not found", async () => {
    mockRepo.findBudgetById.mockResolvedValueOnce(null);
    await expect(service.getBudget("bad-id", "org1"))
      .rejects.toThrow(new AppError("Budget not found", 404));
  });
});

describe("BudgetService.deleteBudget", () => {
  it("busts cache after deletion", async () => {
    mockRepo.findBudgetById.mockResolvedValueOnce(fakeBudget as never);
    mockRepo.deleteBudget.mockResolvedValueOnce(fakeBudget as never);
    await service.deleteBudget("b1", "org1");
    expect(mockCache.cacheBust).toHaveBeenCalledWith("dashboard:*:org1");
  });
});