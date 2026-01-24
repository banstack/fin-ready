import yfinance as yf

# Fetch single security data

def fetch_historical_security_data(single_security, period_time):
    # Validation check on null or type conversion
    ticker = yf.Ticker(single_security)
    historical_data = ticker.history(period=period_time)

    return historical_data.reset_index().to_dict(orient="records")

# TODO: Filter down fields we want
def fetch_full_security_metadata(security_ticker):
    ticker = yf.Ticker(security_ticker)
    return ticker.info

# def fetch_security_metadata(security_ticker):
#     ticker = yf.Ticker(security_ticker)
#     info = ticker.info
#     return {
#         # Metadata
#         "shortName": info.get("shortName"),
#         "sector": info.get("sector"),
#         "country": info.get("country"),
#         "city": info.get("city"),
#         "fullTimeEmployees": info.get("fullTimeEmployees"),
#         "marketCap": info.get("marketCap"),
#         "businessSummary": info.get("longBusinessSummary")
#         # Market 
#     }


# Custom Calculations on Readiness Grade
# Risky, Moderate, To invest


# nvidia = yf.Ticker("NVDA")

# historical_data = nvidia.history(period="1y") # Data from last year
# print("Historical Data:")
# print(historical_data)

# # Fetch basic financials

# financials = nvidia.financials
# print("\nFinancials: ")
# print(financials)