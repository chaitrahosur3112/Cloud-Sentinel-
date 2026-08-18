from pydantic import BaseModel
from typing import List

class AnomalyDataPoint(BaseModel):
    date: str
    amount: float
    resourceId: str

class AnomalyRequest(BaseModel):
    data: List[AnomalyDataPoint]
    # contamination is the expected proportion of anomalies.
    # 0.05 means "we expect ~5% of days to be anomalous."
    # Isolation Forest uses this to set its decision threshold.
    contamination: float = 0.05

class AnomalyPoint(BaseModel):
    date: str
    amount: float
    resourceId: str
    isAnomaly: bool
    anomalyScore: float   # higher = more anomalous

class AnomalyResponse(BaseModel):
    anomalies: List[AnomalyPoint]
    totalAnomalies: int
    anomalyRate: float    # percentage of points flagged