jest.mock("../src/repositories/analytics.repository");
jest.mock("../src/utils/cache");

import * as repo    from "../src/repositories/analytics.repository";
import * as cache   from "../src/utils/cache";
import * as service from "../src/services/analytics.service";

const mockRepo  = repo  as jest.Mocked<typeof repo>;
const mockCache = cache as jest.Mocked<typeof cache>;

const filter = {
  organizationId: "org1",
  from: new Date("2026-06-01"),
  to:   new Date("2026-07-01"),
};

beforeEach(() => {
  mockCache.cacheGet.mockResolvedValue(null);
  mockCache.cacheSet.mockResolvedValue(undefined);
});

describe("AnalyticsService.getCostTrend", () => {
  it("maps raw rows to CostTrendPoints with Number() conversion", async () => {
    mockRepo.getCostTrend.mockResolvedValueOnce([
      { date: new Date("2026-06-15"), total: "123.4567" },
    ] as never);

    const result = await service.getCostTrend(filter);

    expect(result[0].date).toBe("2026-06-15");
    expect(result[0].amount).toBe(123.4567);
    expect(typeof result[0].amount).toBe("number"); // not a string or Decimal
  });

  it("returns cached result without hitting the repo", async () => {
    const cached = [{ date: "2026-06-15", amount: 99 }];
    mockCache.cacheGet.mockResolvedValueOnce(cached);

    const result = await service.getCostTrend(filter);

    expect(result).toEqual(cached);
    expect(mockRepo.getCostTrend).not.toHaveBeenCalled();
  });
});

describe("AnalyticsService.getTopResources", () => {
  it("maps snake_case DB columns to camelCase DTO fields", async () => {
    mockRepo.getTopResources.mockResolvedValueOnce([{
      resource_id:   "r1",
      resource_name: "prod-vm",
      resource_type: "VIRTUAL_MACHINE",
      provider:      "AWS",
      total:         "450.00",
    }] as never);

    const result = await service.getTopResources(filter);

    expect(result[0].resourceId).toBe("r1");
    expect(result[0].resourceName).toBe("prod-vm");
    expect(result[0].amount).toBe(450);
  });
});