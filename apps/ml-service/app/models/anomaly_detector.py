import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from typing import List

def run_anomaly_detection(
    data: List[dict],   # [{"date": ..., "amount": ..., "resourceId": ...}]
    contamination: float = 0.05
) -> List[dict]:
    """
    Run Isolation Forest anomaly detection on cost data.

    Isolation Forest works by:
    1. Randomly selecting a feature (here: cost amount) and a split value
    2. Recursively partitioning data until each point is isolated
    3. Points isolated in fewer steps are MORE anomalous (they're far from the cluster)

    Returns the original data points with isAnomaly and anomalyScore added.
    """

    if len(data) < 10:
        # Not enough data to detect anomalies meaningfully —
        # return everything as non-anomalous
        return [{**point, "isAnomaly": False, "anomalyScore": 0.0} for point in data]

    df = pd.DataFrame(data)

    # We train on the 'amount' column only.
    # In a more advanced version you'd add rolling averages,
    # day-of-week as a feature, etc. — but amount alone works well here.
    X = df[["amount"]].values

    model = IsolationForest(
        contamination=contamination,
        random_state=42,   # fixed seed = reproducible results
        n_estimators=100,
    )
    model.fit(X)

    # predict() returns 1 (normal) or -1 (anomaly)
    predictions = model.predict(X)

    # decision_function() returns the raw anomaly score.
    # More negative = more anomalous. We invert and normalize to 0-1
    # so the frontend can show a "severity" indicator.
    raw_scores  = model.decision_function(X)
    min_score   = raw_scores.min()
    max_score   = raw_scores.max()
    score_range = max_score - min_score if max_score != min_score else 1.0

    results = []
    for i, point in enumerate(data):
        is_anomaly    = bool(predictions[i] == -1)
        # Normalize: 0 = normal, 1 = most anomalous
        anomaly_score = round(float((raw_scores[i] - max_score) / -score_range), 4)

        results.append({
            **point,
            "isAnomaly":    is_anomaly,
            "anomalyScore": anomaly_score,
        })

    return results