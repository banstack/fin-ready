from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from . import service
"""
Entry point for FastAPI
"""

app = FastAPI(
    title="FinReady API",
    description="API that connects you to yfinance data",
    version="1.0.0"
)

# CORS middleware
## TODO: Modify later for enhanced browser security 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials="True",
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the FinReady API",
        "docs": "/docs",
        "version": "1.0.0"
    }


"""
    GET historical data 
    Example string: "/historical/NVDA?period=1d
"""
@app.get("/historical/{security_ticker}")
async def fetch_historical_security_data(security_ticker: str, period: str):
    if period:
        security_data = service.fetch_single_security(security_ticker, period)
    return security_data

"""
    Get data pertaining to security (includes basic financials)
"""
@app.get("/info/{security_ticker}")
async def read_full_security_info(security_ticker: str):
    if security_ticker:
        security_data = service.fetch_full_security_metadata(security_ticker)
    return security_data