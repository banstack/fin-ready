from typing import Optional
from fastapi import APIRouter, HTTPException
from app.services import securities as securities_service

router = APIRouter()

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


@router.get("/topten/{security_ticker}")
async def get_top_ten_in_sector(security_ticker: str):
    data = securities_service.fetch_top_ten_in_sector(security_ticker)
    if data is None:
        raise HTTPException(status_code=404, detail="Ticker or Sector not found")
    
    return {
        "ticker": security_ticker.upper(),
        "count": len(data),
        "results": data
    }

@router.post("/refresh-cache")
async def refresh_cache():
    securities_service.sync_local_cache("manual")
    
    return {
        "status": "Refresh started in background",
        "message": "The system is now repolling Yahoo Finance. This will take ~10 minutes."
    }
