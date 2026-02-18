import yfinance as yf

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
