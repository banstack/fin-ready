from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import securities
from app.core.config import config
from app.core.logger import setup_custom_logger

setup_custom_logger("FinReady")

app = FastAPI(
    title=config.app_name,
    description=config.description,
    version=config.version
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
