# Unit tests for the ML service — needed so CI can run them.
# Tests the model logic directly without starting FastAPI.

import pytest
from app.models.forecaster import run_forecast
from app.models.anomaly_detector import run_anomaly_detection

def make_data(n: int, base: float = 100.0):
    """Generate n days of synthetic cost data."""
    from datetime import date, timedelta
    start = date(2026, 1, 1)
    return [
        {
            "date":   (start + timedelta(days=i)).isoformat(),
            "amount": base + (i % 7) * 5 + (i % 3) * 2,  # realistic weekly pattern
        }
        for i in range(n)
    ]

class TestForecaster:
    def test_requires_at_least_2_points(self):
        with pytest.raises(ValueError, match="At least 2"):
            run_forecast([{"date": "2026-01-01", "amount": 100.0}])

    def test_returns_correct_number_of_forecast_points(self):
        data   = make_data(60)
        result, trend, pct = run_forecast(data, periods=30)
        assert len(result) == 30

    def test_forecast_points_have_required_fields(self):
        data   = make_data(30)
        result, _, _ = run_forecast(data, periods=7)
        for point in result:
            assert "date"      in point
            assert "predicted" in point
            assert "lower"     in point
            assert "upper"     in point
            # lower should never exceed upper
            assert point["lower"] <= point["upper"]

    def test_all_values_are_non_negative(self):
        data   = make_data(30)
        result, _, _ = run_forecast(data)
        for point in result:
            assert point["predicted"] >= 0
            assert point["lower"]     >= 0
            assert point["upper"]     >= 0

    def test_trend_is_one_of_valid_values(self):
        data   = make_data(30)
        _, trend, _ = run_forecast(data)
        assert trend in ("increasing", "decreasing", "stable")


class TestAnomalyDetector:
    def test_returns_same_count_as_input(self):
        data = [
            {"date": f"2026-01-{i:02d}", "amount": float(100 + i), "resourceId": "r1"}
            for i in range(1, 31)
        ]
        result = run_anomaly_detection(data)
        assert len(result) == len(data)

    def test_each_result_has_is_anomaly_field(self):
        data = [
            {"date": f"2026-01-{i:02d}", "amount": 100.0, "resourceId": "r1"}
            for i in range(1, 20)
        ]
        result = run_anomaly_detection(data)
        for r in result:
            assert "isAnomaly"    in r
            assert "anomalyScore" in r
            assert isinstance(r["isAnomaly"], bool)

    def test_obvious_spike_is_flagged(self):
        # 25 normal points + 1 massive spike
        data = [
            {"date": f"2026-01-{i:02d}", "amount": 100.0, "resourceId": "r1"}
            for i in range(1, 26)
        ]
        data.append({"date": "2026-01-26", "amount": 50000.0, "resourceId": "r1"})

        result = run_anomaly_detection(data, contamination=0.05)
        spike  = next(r for r in result if r["amount"] == 50000.0)
        assert spike["isAnomaly"] is True

    def test_small_dataset_returns_no_anomalies(self):
        # Fewer than 10 points — detector returns all as non-anomalous
        data = [
            {"date": f"2026-01-{i:02d}", "amount": 100.0, "resourceId": "r1"}
            for i in range(1, 6)
        ]
        result = run_anomaly_detection(data)
        assert all(not r["isAnomaly"] for r in result)


class TestForecastAPI:
    """Integration tests for the FastAPI endpoints."""

    def test_forecast_endpoint_returns_200(self):
        from fastapi.testclient import TestClient
        from app.main import app

        client = TestClient(app)
        data   = make_data(30)

        response = client.post("/forecast", json={
            "data":    [{"date": p["date"], "amount": p["amount"]} for p in data],
            "periods": 7,
        })

        assert response.status_code == 200
        body = response.json()
        assert "forecast"       in body
        assert "trend"          in body
        assert "percentChange"  in body
        assert len(body["forecast"]) == 7

    def test_forecast_endpoint_rejects_insufficient_data(self):
        from fastapi.testclient import TestClient
        from app.main import app

        client   = TestClient(app)
        response = client.post("/forecast", json={
            "data": [{"date": "2026-01-01", "amount": 100.0}],
        })

        assert response.status_code == 422

    def test_anomaly_endpoint_returns_200(self):
        from fastapi.testclient import TestClient
        from app.main import app

        client = TestClient(app)
        data   = [
            {"date": f"2026-01-{i:02d}", "amount": 100.0 + i, "resourceId": "r1"}
            for i in range(1, 21)
        ]

        response = client.post("/detect-anomalies", json={"data": data})
        assert response.status_code == 200

        body = response.json()
        assert "anomalies"       in body
        assert "totalAnomalies"  in body
        assert "anomalyRate"     in body

    def test_health_endpoint(self):
        from fastapi.testclient import TestClient
        from app.main import app

        client   = TestClient(app)
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"