import yfinance as yf
import pandas as pd
import requests
import os

from datetime import datetime

from app.core.logger import logger

CACHE_FILE = "sp500_cache.csv"
WIKI_URL = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies"

def fetch_historical_security_data(single_security, period_time):
    ticker = yf.Ticker(single_security)
    historical_data = ticker.history(period=period_time)
    return historical_data.reset_index().to_dict(orient="records")


def fetch_historical_interval_data(single_security, period_time, interval):
    ticker = yf.Ticker(single_security)
    historical_data = ticker.history(period=period_time, interval=interval)
    return historical_data.reset_index().to_dict(orient="records")


def fetch_full_security_metadata(security_ticker):
    ticker = yf.Ticker(security_ticker)
    return ticker.info

def scape_sp500_financials():
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(WIKI_URL, headers=headers)
    all_tickers = pd.read_html(response.text)[0]['Symbol'].str.replace('.', '-', regex=False).tolist()

    full_data = []
    for ticker in all_tickers:
        try:
            stock = yf.Ticker(ticker)
            info = stock.info
            full_data.append({
                'Ticker': ticker,
                'Name': info.get('shortName'),
                'Sector': info.get('sector'),
                'MarketCap': info.get('marketCap', 0),
                'EBITDA': info.get('ebitda'),
                'PE_Ratio': info.get('trailingPE'),
                'DebtToEquity': info.get('debtToEquity'),
                'CurrentRatio': info.get('currentRatio'),
                'GrossMargin': info.get('grossMargins'),
                'OperatingMargin': info.get('operatingMargins'),
                'FreeCashFlow': info.get('freeCashflow'),
                'RevenueGrowth': info.get('revenueGrowth'),
                'Market': info.get('market'),
            })
            print(f"Fetched: {ticker}") # Progress tracker
        except Exception:
            continue
    return full_data

def sync_local_cache(reason="automated"):
    """
    Handles the actual update and saving of sp500 into cache
    Distinguishes output based on 'reason' param.
    """
    if reason == "manual":
        logger.info("[MANUAL REFRESH] Force-updating cache via user request...")
    else:
        logger.info("[AUTO REFRESH] Cache expired or missing. Updating now...")

    # Get tickers from wiki
    full_data = scape_sp500_financials()

    df = pd.DataFrame(full_data)
    df.to_csv(CACHE_FILE, index=False)

    logger.debug(f"[FinReady] Cache Successfully Updated ({reason})")
    return df

def load_sp500_data():
    # Check if cache exists and was modified today
    if os.path.exists(CACHE_FILE):
        file_time = datetime.fromtimestamp(os.path.getmtime(CACHE_FILE)).date()
        if file_time == datetime.now().date():
            logger.info("[FinReady] Loading data from local cache")
            return pd.read_csv(CACHE_FILE)

    logger.warn("[FinReady] Cache expired or missing. Crawling S&P 500 (this takes ~5 mins)...")
    return sync_local_cache(reason="automated")

def fetch_top_ten_in_sector(input_ticker):
    # 1. Get all data (either from Cache or API)
    master_df = load_sp500_data()

    # 2. Identify the sector of our target ticker
    # Look it up in our master_df instead of making a new API call
    target_row = master_df[master_df['Ticker'] == input_ticker.upper()]
    
    if target_row.empty:
        return f"Ticker {input_ticker} not found in S&P 500 list."

    target_sector = target_row.iloc[0]['Sector']
    logger.debug(f"\nFiltering for Top 10 in: {target_sector}")

    # 3. Filter for the sector and sort by MarketCap
    top_10_df = master_df[
        (master_df['Sector'] == target_sector) &
        (master_df['Market'] == "us_market")
    ].sort_values(by='MarketCap', ascending=False).head(10)


    return top_10_df.to_dict('records')

