# Pydantic schemas define the shape of data coming IN and going OUT.
# FastAPI uses these to auto-validate requests and auto-generate docs.
# If the client sends wrong types, FastAPI returns a 422 before your
# code even runs — same idea as our TypeScript validators.

from pydantic import BaseModel
from typing import List

class CostDataPoint(BaseModel):
    date: str      # "2026-06-15"
    amount: float

class ForecastRequest(BaseModel):
    data: List[CostDataPoint]
    periods: int = 30   # how many days to forecast ahead (default 30)

class ForecastPoint(BaseModel):
    date: str
    predicted: float
    lower: float        # confidence interval lower bound
    upper: float        # confidence interval upper bound

class ForecastResponse(BaseModel):
    forecast: List[ForecastPoint]
    trend: str          # "increasing" | "decreasing" | "stable"
    percentChange: float  # predicted change over the forecast period