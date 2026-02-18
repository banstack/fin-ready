from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import securities

app = FastAPI(
    title="FinReady API",
    description="API that connects you to yfinance data",
    version="1.0.0"
)

# CORS middleware
# TODO: Restrict origins for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(securities.router, prefix="/api/v1")
