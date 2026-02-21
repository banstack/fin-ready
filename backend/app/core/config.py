from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()


class Config(BaseSettings):
    app_name: str = "FinReady"
    description: str = "API that connects you to yfinance data"
    version: str = "1.0.0"
    debug: bool = False


config = Config()