from pydantic import BaseModel
from typing import Optional

class HistoricalDataPoint(BaseModel):
    Date: Optional[str] = None
    Datetime: Optional[str] = None
    Open: float
    High: float
    Low: float
    Close: float
    Volume: int

class SecurityInfoResponse(BaseModel):
    symbol: Optional[str] = None
    shortName: Optional[str] = None
    sector: Optional[str] = None
    regularMarketPrice: Optional[float] = None
    regularMarketChange: Optional[float] = None
    regularMarketChangePercent: Optional[float] = None
    longBusinessSummary: Optional[str] = None
    marketCap: Optional[int] = None
    trailingPE: Optional[float] = None
    ebitda: Optional[float] = None
    debtToEquity: Optional[float] = None
    currentRatio: Optional[float] = None
    grossMargins: Optional[float] = None
    operatingMargins: Optional[float] = None
    freeCashflow: Optional[float] = None
    revenueGrowth: Optional[float] = None
