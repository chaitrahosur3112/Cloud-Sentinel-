# FastAPI entry point.
# This is equivalent to app.ts in Express — it assembles the app,
# registers routers, and adds middleware (CORS, health check).

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import forecast, anomaly
import logging

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="CloudCost Sentinel ML Service",
    description="Forecasting and anomaly detection for cloud cost data",
    version="1.0.0",
)

# Only the Express API should call this service — not the public internet.
# In production this would be a private VPC endpoint with no public route.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://api:4000", "http://localhost:4000"],
    allow_methods=["POST"],
    allow_headers=["*"],
)

app.include_router(forecast.router, tags=["Forecasting"])
app.include_router(anomaly.router,  tags=["Anomaly Detection"])

@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok", "service": "ml-service"}