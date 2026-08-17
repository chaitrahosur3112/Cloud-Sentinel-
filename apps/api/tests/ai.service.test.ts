jest.mock("../src/repositories/ai.repository");
jest.mock("../src/utils/mlClient");

import * as repo from "../src/repositories/ai.repository";
import * as mlClient from "../src/utils/mlClient";
import * as service from "../src/services/ai.service";
import { AppError } from "../src/utils/AppError";

const mockRepo = repo as jest.Mocked<typeof repo>;
const mockMlClient = mlClient as jest.Mocked<typeof mlClient>;

const fakeForecastResult = {
  forecast: [
    {
      date: "2026-07-10",
      predicted: 150,
      lower: 120,
      upper: 180,
    },
  ],
  trend: "stable",
  percentChange: 2.5,
};

// Helper: generate N days of fake cost records
function makeDays(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - i));

    return {
      date: d,
      amount: 100 + i,
      resource_id: "r1",
    };
  });
}

describe("AiService.forecastResourceCost", () => {
  it("throws 404 when resource not found", async () => {
    mockRepo.getDailyHistoryForResource.mockResolvedValueOnce(null);

    await expect(
      service.forecastResourceCost("bad-id", "org1")
    ).rejects.toThrow(new AppError("Resource not found", 404));
  });

  it("throws 422 when fewer than 14 days of history", async () => {
    mockRepo.getDailyHistoryForResource.mockResolvedValueOnce({
      resource: {
        id: "r1",
        name: "prod-vm",
      },
      rows: makeDays(5),
    } as never);

    await expect(
      service.forecastResourceCost("r1", "org1")
    ).rejects.toThrow(
      new AppError(
        "Not enough cost history for forecasting. At least 14 days of data required.",
        422
      )
    );
  });

  it("calls mlClient.getForecast with correctly formatted data", async () => {
    mockRepo.getDailyHistoryForResource.mockResolvedValueOnce({
      resource: {
        id: "r1",
        name: "prod-vm",
      },
      rows: makeDays(30),
    } as never);

    mockMlClient.getForecast.mockResolvedValueOnce(fakeForecastResult);

    const result = await service.forecastResourceCost("r1", "org1");

    expect(mockMlClient.getForecast).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          date: expect.any(String),
          amount: expect.any(Number),
        }),
      ]),
      30
    );

    expect(result.trend).toBe("stable");
    expect(result.resourceName).toBe("prod-vm");
  });
});

describe("AiService.detectCostAnomalies", () => {
  it("throws 422 when fewer than 10 data points", async () => {
    mockRepo.getAllResourceDailyHistory.mockResolvedValueOnce(
      makeDays(3) as never
    );

    await expect(
      service.detectCostAnomalies("org1")
    ).rejects.toThrow(
      new AppError("Not enough cost data for anomaly detection.", 422)
    );
  });

  it("returns only flagged anomalies in the response", async () => {
    mockRepo.getAllResourceDailyHistory.mockResolvedValueOnce(
      makeDays(30) as never
    );

    mockMlClient.detectAnomalies.mockResolvedValueOnce({
      anomalies: [
        {
          date: "2026-06-01",
          amount: 500,
          resourceId: "r1",
          isAnomaly: true,
          anomalyScore: 0.9,
        },
        {
          date: "2026-06-02",
          amount: 100,
          resourceId: "r1",
          isAnomaly: false,
          anomalyScore: 0.1,
        },
      ],
      totalAnomalies: 1,
      anomalyRate: 3.33,
    });

    const result = await service.detectCostAnomalies("org1");

    // Only the anomalous point should be in the result
    expect(result.anomalies).toHaveLength(1);
    expect(result.anomalies[0].amount).toBe(500);
    expect(result.totalAnomalies).toBe(1);
  });
});