from fastapi import APIRouter, HTTPException
from app.schemas.forecast import (
    ForecastRequest,
    ForecastResponse,
    ForecastPoint,
)
from app.models.forecaster import run_forecast
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/forecast", response_model=ForecastResponse)
async def forecast(request: ForecastRequest):
    """
    Accept historical cost data and return a Prophet forecast.

    The Express API calls this internally — the frontend never calls it directly.
    """

    try:
        # ---------------------------------------------------------
        # Validate minimum data points
        # ---------------------------------------------------------
        if len(request.data) < 2:
            raise HTTPException(
                status_code=422,
                detail="At least 2 data points are required for forecasting",
            )

        # ---------------------------------------------------------
        # Prepare data for the forecasting model
        # ---------------------------------------------------------
        data = [
            {
                "date": p.date,
                "amount": p.amount,
            }
            for p in request.data
        ]

        # ---------------------------------------------------------
        # Run Prophet forecast
        # ---------------------------------------------------------
        forecast_points, trend, percent_change = run_forecast(
            data,
            request.periods,
        )

        # ---------------------------------------------------------
        # Build API response
        # ---------------------------------------------------------
        return ForecastResponse(
            forecast=[
                ForecastPoint(
                    date=p["date"],
                    predicted=p["predicted"],
                    lower=p["lower"],
                    upper=p["upper"],
                )
                for p in forecast_points
            ],
            trend=trend,
            percentChange=percent_change,
        )

    # IMPORTANT:
    # Do not convert an existing HTTPException into a 500.
    except HTTPException:
        raise

    # Validation/model errors should return 422.
    except ValueError as e:
        raise HTTPException(
            status_code=422,
            detail=str(e),
        )

    # Unexpected errors should return 500.
    except Exception:
        logger.exception("Forecast error")
        raise HTTPException(
            status_code=500,
            detail="Forecast failed",
        )