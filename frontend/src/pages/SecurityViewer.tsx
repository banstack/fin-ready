import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { TickerSearch } from '@/components/TickerSearch'
import { useSecurity, useHistorical } from '@/hooks/useSecurityHooks'
import { StockHeader, PriceChart, FinancialHealth } from '@/components/securityViewer'

const periodOptions = [
  { value: '1d', label: '1D', interval: '5m' },
  { value: '1mo', label: '1M', interval: undefined },
  { value: '6mo', label: '6M', interval: undefined },
  { value: '1y', label: '1Y', interval: undefined },
  { value: 'ytd', label: 'YTD', interval: undefined },
  { value: 'max', label: 'MAX', interval: undefined },
]

export function SecurityViewer() {
  const { ticker: tickerParam } = useParams<{ ticker: string }>()
  const navigate = useNavigate()
  const searchQuery = tickerParam?.toUpperCase() ?? ''

  function selectTicker(ticker: string) {
    navigate(`/app/${ticker}`)
  }

  const [period, setPeriod] = useState('1mo')

  // Data fetching
  const { data, isLoading } = useSecurity(searchQuery)

  const selectedPeriod = periodOptions.find((p) => p.value === period)
  const interval = selectedPeriod?.interval

  const { data: historicalData, isLoading: isHistoricalLoading } = useHistorical(
    searchQuery,
    period,
    interval
  )

  const isIntraday = period === '1d'
  const chartData =
    historicalData?.map((d) => {
      const timestamp = d.Datetime || d.Date || ''
      const dateObj = new Date(timestamp)
      return {
        date: isIntraday
          ? dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
          : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: d.Close,
      }
    }) ?? []

  return (
    <div className="min-h-screen bg-background pb-32">
      <Navbar variant="app" />

      <div className="container px-4 md:px-6 lg:px-8 py-6 md:py-10">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Page header */}
          <div className="space-y-2">
            <button
              onClick={() => navigate('/markets')}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground border border-border hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Back to Markets"
            >
              <ArrowLeft className="h-4 w-4" />
              Markets
            </button>
            <h1 className="text-3xl font-bold tracking-tight">Security Analyzer</h1>
            <p className="text-muted-foreground">Search and analyze securities</p>
          </div>

          {/* Main content */}
          {!isLoading && (
            <div className="grid gap-6 lg:grid-cols-5 pb-24">
              {/* Left column — stock info & chart */}
              <div className="lg:col-span-3 space-y-6">
                <StockHeader
                  shortName={data.shortName}
                  symbol={data.symbol}
                  regularMarketPrice={data.regularMarketPrice}
                  regularMarketChange={data.regularMarketChange}
                  regularMarketChangePercent={data.regularMarketChangePercent}
                  longBusinessSummary={data.longBusinessSummary}
                />
                <PriceChart
                  periodOptions={periodOptions}
                  period={period}
                  onPeriodChange={setPeriod}
                  chartData={chartData}
                  isHistoricalLoading={isHistoricalLoading}
                />
              </div>

              {/* Right column — financial metrics */}
              <div className="lg:col-span-2">
                <FinancialHealth data={data} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed bottom search bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-3 md:py-4">
          <TickerSearch
            onSelect={selectTicker}
            placeholder="Switch ticker (e.g. Nvidia, JPM)"
            className="mx-auto max-w-lg"
          />
        </div>
      </div>
    </div>
  )
}
