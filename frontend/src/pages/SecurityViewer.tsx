import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { TickerSearch } from '@/components/TickerSearch'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { Navbar } from '@/components/Navbar'
import { useSecurity, useHistorical } from '@/hooks/useSecurityHooks'
import { formatBillions } from '@/lib/utils'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Filler
)

const periodOptions = [
  { value: '1d', label: '1D', interval: '5m' },
  { value: '1mo', label: '1M', interval: undefined },
  { value: '6mo', label: '6M', interval: undefined },
  { value: '1y', label: '1Y', interval: undefined },
  { value: 'ytd', label: 'YTD', interval: undefined },
  { value: 'max', label: 'MAX', interval: undefined },
]

const getMetricCards = (data: Record<string, unknown>) => [
  {
    label: 'EBITDA',
    value: formatBillions(data.ebitda as number),
    status: 'healthy' as const,
  },
  {
    label: 'P/E Ratio',
    value: data.trailingPE ? Math.abs(data.trailingPE as number).toFixed(2) : null,
    status: 'healthy' as const,
  },
  {
    label: 'Debt to Equity',
    value: data.debtToEquity,
    status: 'healthy' as const,
  },
  {
    label: 'Current Ratio',
    value: data.currentRatio,
    status: 'moderate' as const,
  },
  {
    label: 'Gross Margin',
    value: data.grossMargins
      ? `${((data.grossMargins as number) * 100).toFixed(2)}%`
      : null,
    status: 'healthy' as const,
  },
  {
    label: 'Operating Margin',
    value: data.operatingMargins
      ? `${Math.abs((data.operatingMargins as number) * 100).toFixed(2)}%`
      : null,
    status: 'healthy' as const,
  },
  {
    label: 'Free Cash Flow',
    value: formatBillions(data.freeCashflow as number),
    status: 'healthy' as const,
  },
  {
    label: 'Revenue Growth (YoY)',
    value: data.revenueGrowth
      ? `${Math.abs((data.revenueGrowth as number) * 100).toFixed(2)}%`
      : null,
    status: 'moderate' as const,
  },
]

type HealthStatus = 'healthy' | 'moderate' | 'warning'

const statusColors: Record<HealthStatus, string> = {
  healthy: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/20',
  moderate: 'bg-amber-500/15 text-amber-700 border-amber-500/20',
  warning: 'bg-red-500/15 text-red-700 border-red-500/20',
}

const statusLabels: Record<HealthStatus, string> = {
  healthy: 'Healthy',
  moderate: 'Moderate',
  warning: 'Attention',
}

function MetricCard({
  label,
  value,
  status,
}: {
  label: string
  value: string
  status: HealthStatus
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
      <Badge variant="outline" className={statusColors[status]}>
        {statusLabels[status]}
      </Badge>
    </div>
  )
}

const valueCheck = (value: string) => {
  if (value === '0B' || value === '0%') {
    return 'N/A'
  }
  return value ? value : 'N/A'
}

export function SecurityViewer() {
  const { ticker: tickerParam } = useParams<{ ticker: string }>()
  const navigate = useNavigate()
  const searchQuery = tickerParam?.toUpperCase() ?? ''

  function selectTicker(ticker: string) {
    navigate(`/app/${ticker}`)
  }

  const [period, setPeriod] = useState('1mo')
  const { data, isLoading } = useSecurity(searchQuery)

  const selectedPeriod = periodOptions.find((p) => p.value === period)
  const interval = selectedPeriod?.interval

  const { data: historicalData, isLoading: isHistoricalLoading } = useHistorical(
    searchQuery,
    period,
    interval
  )

  const isMarketChangePos =
    data && data.regularMarketChangePercent ? data.regularMarketChangePercent > 0 : false

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

  const isPositiveTrend =
    chartData.length > 1 ? chartData[chartData.length - 1].price > chartData[0].price : true

  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="app" />

      <div className="container px-4 md:px-6 lg:px-8 py-6 md:py-10">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header */}
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

          {/* Main Content */}
          {!isLoading && (
            <div className="grid gap-6 lg:grid-cols-5 pb-24">
              {/* Left Section - Stock Info & Chart */}
              <div className="lg:col-span-3 space-y-6">
                {/* Stock Header */}
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-2xl">{data.shortName}</CardTitle>
                        <CardDescription className="text-base font-medium">
                          {data.symbol}
                        </CardDescription>
                      </div>
                      <Badge
                        variant="secondary"
                        className={
                          isMarketChangePos
                            ? 'bg-emerald-500/15 text-emerald-700'
                            : 'bg-red-500/15 text-red-700'
                        }
                      >
                        {isMarketChangePos ? (
                          <TrendingUp className="mr-1 h-3 w-3" />
                        ) : (
                          <TrendingDown className="mr-1 h-3 w-3" />
                        )}
                        {isMarketChangePos ? '+' : ''}
                        {Math.abs(data.regularMarketChangePercent).toFixed(3)}%
                      </Badge>
                    </div>
                    <div className="flex items-baseline gap-3 pt-2">
                      <span className="text-4xl font-bold">${data.regularMarketPrice}</span>
                      <span
                        className={`flex items-center text-sm font-medium ${
                          isMarketChangePos ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {isMarketChangePos ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                        ${Math.abs(data.regularMarketChange).toFixed(2)} today
                      </span>
                    </div>
                    <div className="mt-3">{data.longBusinessSummary}</div>
                  </CardHeader>
                </Card>

                {/* Stock Chart */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Price History</CardTitle>
                        <CardDescription>Historical price performance</CardDescription>
                      </div>
                      <div className="flex gap-1">
                        {periodOptions.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setPeriod(opt.value)}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${
                              period === opt.value
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] w-full">
                      {isHistoricalLoading ? (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                          Loading chart data...
                        </div>
                      ) : chartData.length > 0 ? (
                        <Line
                          data={{
                            labels: chartData.map((d) => d.date),
                            datasets: [
                              {
                                label: 'Price',
                                data: chartData.map((d) => d.price),
                                fill: true,
                                backgroundColor: isPositiveTrend
                                  ? 'rgba(34, 197, 94, 0.2)'
                                  : 'rgba(239, 68, 68, 0.2)',
                                borderColor: isPositiveTrend
                                  ? 'rgb(34, 197, 94)'
                                  : 'rgb(239, 68, 68)',
                                borderWidth: 2,
                                pointBackgroundColor: isPositiveTrend
                                  ? 'rgb(34, 197, 94)'
                                  : 'rgb(239, 68, 68)',
                                pointRadius: chartData.length > 50 ? 0 : 4,
                                pointHoverRadius: 6,
                                tension: 0.4,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              tooltip: {
                                callbacks: {
                                  label: (context) =>
                                    `$${(context.parsed.y ?? 0).toFixed(2)}`,
                                },
                              },
                            },
                            scales: {
                              y: {
                                ticks: {
                                  callback: (value: string | number) => `$${value}`,
                                },
                              },
                            },
                          }}
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                          No data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Section - Financial Metrics */}
              <div className="lg:col-span-2">
                <Card className="h-fit">
                  <CardHeader>
                    <CardTitle className="text-lg">Financial Health</CardTitle>
                    <CardDescription>Key metrics and indicators</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {getMetricCards(data).map((metric, index, arr) => (
                      <div key={metric.label}>
                        <MetricCard
                          label={metric.label}
                          value={valueCheck(String(metric.value))}
                          status={metric.status}
                        />
                        {index < arr.length - 1 && <Separator />}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Search Bar */}
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
