from fastapi import APIRouter, HTTPException
from app.schemas.anomaly import AnomalyRequest, AnomalyResponse, AnomalyPoint
from app.models.anomaly_detector import run_anomaly_detection
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/detect-anomalies", response_model=AnomalyResponse)
async def detect_anomalies(request: AnomalyRequest):
    """
    Accept cost records and return anomaly flags using Isolation Forest.
    """
    try:
        data = [
            {
                "date":       p.date,
                "amount":     p.amount,
                "resourceId": p.resourceId,
            }
            for p in request.data
        ]

        results = run_anomaly_detection(data, request.contamination)

        anomaly_points = [
            AnomalyPoint(
                date=r["date"],
                amount=r["amount"],
                resourceId=r["resourceId"],
                isAnomaly=r["isAnomaly"],
                anomalyScore=r["anomalyScore"],
            )
            for r in results
        ]

        total_anomalies = sum(1 for p in anomaly_points if p.isAnomaly)
        anomaly_rate    = round(total_anomalies / len(anomaly_points) * 100, 2) if anomaly_points else 0.0

        return AnomalyResponse(
            anomalies=anomaly_points,
            totalAnomalies=total_anomalies,
            anomalyRate=anomaly_rate,
        )

    except Exception as e:
        logger.error(f"Anomaly detection error: {e}")
        raise HTTPException(status_code=500, detail="Anomaly detection failed")