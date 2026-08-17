# This file contains the actual ML logic.
# It does not know about HTTP — it just takes data in, returns predictions.
# Keeping ML logic separate from route handlers is the same
# controller/service split we use in Express.

import pandas as pd
import numpy as np
from prophet import Prophet
from typing import List, Tuple
import logging

# Suppress Prophet's verbose output in production
logging.getLogger("prophet").setLevel(logging.WARNING)
logging.getLogger("cmdstanpy").setLevel(logging.WARNING)

def run_forecast(
    data: List[dict],   # [{"date": "2026-06-01", "amount": 123.45}, ...]
    periods: int = 30
) -> Tuple[List[dict], str, float]:
    """
    Run Prophet forecast on cost data.
    
    Returns:
        - list of forecast points with predicted/lower/upper values
        - trend direction: "increasing" | "decreasing" | "stable"
        - percent change between first and last predicted value
    """

    # Prophet requires a DataFrame with exactly two columns:
    # 'ds' (datestamp) and 'y' (the value to forecast).
    df = pd.DataFrame([
        {"ds": pd.to_datetime(point["date"]), "y": float(point["amount"])}
        for point in data
    ])

    # Need at least 2 data points to fit a model.
    # In practice we always send 90 days, but guard against edge cases.
    if len(df) < 2:
        raise ValueError("At least 2 data points are required for forecasting")

    # Fit the Prophet model.
    # yearly_seasonality=False because we rarely have > 1 year of data.
    # weekly_seasonality=True because cloud costs vary by day of week.
    model = Prophet(
        yearly_seasonality=False,
        weekly_seasonality=True,
        daily_seasonality=False,
        # interval_width controls the confidence interval width.
        # 0.80 = 80% confidence interval (tighter/more useful than 95%)
        interval_width=0.80,
    )
    model.fit(df)

    # Make a future DataFrame (the dates we want predictions for)
    future = model.make_future_dataframe(periods=periods)
    forecast_df = model.predict(future)

    # We only return the FUTURE predictions, not the historical fitted values.
    # 'tail(periods)' gives us just the forecasted period.
    future_forecast = forecast_df.tail(periods)

    result = []
    for _, row in future_forecast.iterrows():
        result.append({
            "date":      row["ds"].strftime("%Y-%m-%d"),
            "predicted": round(max(0, float(row["yhat"])),      2),
            "lower":     round(max(0, float(row["yhat_lower"])), 2),
            "upper":     round(max(0, float(row["yhat_upper"])), 2),
        })

    # Determine trend from first vs last predicted value
    if len(result) >= 2:
        first_val = result[0]["predicted"]
        last_val  = result[-1]["predicted"]
        if first_val == 0:
            percent_change = 0.0
            trend = "stable"
        else:
            percent_change = round(((last_val - first_val) / first_val) * 100, 2)
            if percent_change > 5:
                trend = "increasing"
            elif percent_change < -5:
                trend = "decreasing"
            else:
                trend = "stable"
    else:
        percent_change = 0.0
        trend = "stable"

    return result, trend, percent_change