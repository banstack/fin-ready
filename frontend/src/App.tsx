import { useState } from 'react'
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

import { useSecurity } from './hooks/useSecurityHooks'
import { availableTickers } from './constant'
import { formatBillions } from './lib/utils'

// Mock chart data (6 months)
const mockChartData = [
  { date: 'Aug', price: 175.84 },
  { date: 'Sep', price: 171.21 },
  { date: 'Oct', price: 170.77 },
  { date: 'Nov', price: 189.95 },
  { date: 'Dec', price: 193.60 },
  { date: 'Jan', price: 178.72 },
]

const getMetricCards = (data: Record<string, unknown>) => [
    {
        label: "EBITDA",
        value: formatBillions(data.ebitda as number),
        status: 'healthy' as const
    },
    {
        label: "P/E Ratio",
        value: data.trailingPE ? Math.abs(data.trailingPE as number).toFixed(2) : null,
        status: 'healthy' as const
    },
    {
        label: "Debt to Equity",
        value: data.debtToEquity,
        status: 'healthy' as const
    },
    {
        label: "Current Ratio",
        value: data.currentRatio,
        status: 'moderate' as const
    },
    {
        label: "Gross Margin",
        value: data.grossMargins ? `${((data.grossMargins as number) * 100).toFixed(2)}%` : null,
        status: 'healthy' as const
    },
    {
        label: "Operating Margin",
        value: data.operatingMargins ? `${Math.abs((data.operatingMargins as number) * 100).toFixed(2)}%` : null,
        status: 'healthy' as const
    },
    {
        label: "Free Cash Flow",
        value: formatBillions(data.freeCashflow as number),
        status: 'healthy' as const
    },
    {
        label: "Revenue Growth (YoY)",
        value: data.revenueGrowth ? `${Math.abs((data.revenueGrowth as number) * 100).toFixed(2)}%` : null,
        status: 'moderate' as const
    }
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

function MetricCard({ label, value, status }: { label: string; value: string; status: HealthStatus }) {
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
    if (value == "0B" || value == "0%") {
        return "N/A"
    }

    return value ? value : "N/A";
}

function App() {
  const [searchQuery, setSearchQuery] = useState('NVDA')
  const { data, isLoading } = useSecurity(searchQuery);

  const isMarketChangePos = data && data.regularMarketChangePercent 
    ? data.regularMarketChangePercent > 0 
    : false;


  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">FinReady</h1>
          <p className="text-muted-foreground">Search and analyze securities</p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl">
            <Select onValueChange={setSearchQuery} value={searchQuery}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a ticker (i.e. NVDA)" />
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(availableTickers).map(([sector, tickers]) => (
                      <SelectGroup key={sector}>
                        <SelectLabel className="capitalize">{sector.replace('-', ' ')}</SelectLabel>
                        {tickers.map((ticker) => (
                          <SelectItem key={ticker} value={ticker}>
                            {ticker}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                </SelectContent>
            </Select>
        </div>

        {/* Main Content */}
        { !isLoading &&
        <div className="grid gap-6 lg:grid-cols-5">
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
                    className={isMarketChangePos
                      ? 'bg-emerald-500/15 text-emerald-700'
                      : 'bg-red-500/15 text-red-700'
                    }
                  >
                    {isMarketChangePos ? (
                      <TrendingUp className="mr-1 h-3 w-3" />
                    ) : (
                      <TrendingDown className="mr-1 h-3 w-3" />
                    )}
                    {isMarketChangePos ? '+' : ''}{Math.abs(data.regularMarketChangePercent).toFixed(3)}%
                  </Badge>
                </div>
                <div className="flex items-baseline gap-3 pt-2">
                  <span className="text-4xl font-bold">${data.regularMarketPrice}</span>
                  <span className={`flex items-center text-sm font-medium ${
                    isMarketChangePos ? 'text-emerald-600' : 'text-red-600'
                  }`}>
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
                <CardTitle className="text-lg">Price History</CardTitle>
                <CardDescription>Last 6 months performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="date"
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis
                        domain={['dataMin - 5', 'dataMax + 5']}
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Price']}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
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
                // Element, index, arr
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
        }
      </div>
    </div>
  )
}

export default App
