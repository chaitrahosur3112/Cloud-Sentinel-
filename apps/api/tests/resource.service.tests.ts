jest.mock("../src/repositories/resource.repository");
jest.mock("../src/repositories/cloudaccount.repository");
jest.mock("../src/utils/cache");

import * as repo    from "../src/repositories/resource.repository";
import * as cache   from "../src/utils/cache";
import * as service from "../src/services/resource.service";
import { AppError } from "../src/utils/AppError";

const mockRepo  = repo  as jest.Mocked<typeof repo>;
const mockCache = cache as jest.Mocked<typeof cache>;

beforeEach(() => {
  mockCache.cacheGet.mockResolvedValue(null);
  mockCache.cacheSet.mockResolvedValue(undefined);
});

describe("ResourceService.listResources", () => {
  it("returns paginated list with computed currentMonthCost", async () => {
    mockRepo.findResources.mockResolvedValueOnce({
      total: 1,
      resources: [{
        id: "r1", name: "prod-vm", type: "VIRTUAL_MACHINE",
        region: "us-east-1", externalId: "ext-r1",
        cloudAccount: { provider: "AWS", accountName: "Acme AWS" },
        alerts:      [{ id: "a1" }],                             // has open alert
        costRecords: [{ amount: 80 }, { amount: 40 }],           // sum = 120
      }] as never,
    });

    const result = await service.listResources({
      organizationId: "org1", page: 1, limit: 20,
    });

    expect(result.data[0].currentMonthCost).toBe(120);
    expect(result.data[0].hasOpenAlerts).toBe(true);
    expect(result.pagination.total).toBe(1);
    expect(result.pagination.totalPages).toBe(1);
  });
});

describe("ResourceService.getResourceDetail", () => {
  it("throws 404 when resource is not found", async () => {
    mockRepo.findResourceById.mockResolvedValueOnce(null);
    await expect(service.getResourceDetail("bad-id", "org1"))
      .rejects.toThrow(new AppError("Resource not found", 404));
  });

  it("returns full detail including recommendations and alerts", async () => {
    mockRepo.findResourceById.mockResolvedValueOnce({
      id: "r1", name: "prod-vm", type: "VIRTUAL_MACHINE",
      region: "us-east-1", externalId: "ext-r1",
      cloudAccount: { provider: "AWS", accountName: "Acme AWS" },
      alerts:          [{ id: "a1", type: "COST_SPIKE", status: "OPEN", message: "Spike", createdAt: new Date() }],
      recommendations: [{ id: "rec1", description: "Downsize", estimatedSavings: 50 }],
      costRecords:     [{ amount: 100 }],
    } as never);

    const result = await service.getResourceDetail("r1", "org1");

    expect(result.name).toBe("prod-vm");
    expect(result.currentMonthCost).toBe(100);
    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0].estimatedSavings).toBe(50);
    expect(result.alerts).toHaveLength(1);
  });
});

describe("ResourceService.getResourceTypeSummary", () => {
  it("returns cached result when available", async () => {
    const cached = [{ type: "VIRTUAL_MACHINE", count: 3, totalMonthlyCost: 360 }];
    mockCache.cacheGet.mockResolvedValueOnce(cached);

    const result = await service.getResourceTypeSummary("org1");

    expect(result).toEqual(cached);
    expect(mockRepo.getResourceTypeSummary).not.toHaveBeenCalled();
  });
});