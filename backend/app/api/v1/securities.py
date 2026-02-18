from typing import Optional
from fastapi import APIRouter
from app.core.services import securities as securities_service

router = APIRouter()


@router.get("/")
def read_root():
    return {
        "message": "Welcome to the FinReady API",
        "docs": "/docs",
        "version": "1.0.0"
    }


@router.get("/historical/{security_ticker}")
async def fetch_historical_security_data(
    security_ticker: str,
    period: str,
    interval: Optional[str] = None
):
    if interval:
        return securities_service.fetch_historical_interval_data(security_ticker, period, interval)
    return securities_service.fetch_historical_security_data(security_ticker, period)


@router.get("/info/{security_ticker}")
async def read_full_security_info(security_ticker: str):
    return securities_service.fetch_full_security_metadata(security_ticker)
