import { useState } from 'react'
import { Search, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

// Mock stock data
const mockStockData = {
  name: 'Apple Inc.',
  ticker: 'AAPL',
  price: 178.72,
  change: 2.34,
  changePercent: 1.33,
  isPositive: true,
}

// Mock chart data (6 months)
const mockChartData = [
  { date: 'Aug', price: 175.84 },
  { date: 'Sep', price: 171.21 },
  { date: 'Oct', price: 170.77 },
  { date: 'Nov', price: 189.95 },
  { date: 'Dec', price: 193.60 },
  { date: 'Jan', price: 178.72 },
]

// Mock financial metrics
const mockMetrics = {
  ebitda: { value: '123.9B', status: 'healthy' as const },
  peRatio: { value: '28.4', status: 'moderate' as const },
  debtToEquity: { value: '1.87', status: 'moderate' as const },
  currentRatio: { value: '0.94', status: 'warning' as const },
  grossMargin: { value: '45.9%', status: 'healthy' as const },
  operatingMargin: { value: '29.8%', status: 'healthy' as const },
  freeCashFlow: { value: '99.6B', status: 'healthy' as const },
  revenueGrowth: { value: '-2.8%', status: 'warning' as const },
}

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

function App() {
  const [searchQuery, setSearchQuery] = useState('')

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
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search securities (e.g., AAPL, MSFT, GOOGL)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left Section - Stock Info & Chart */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stock Header */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl">{mockStockData.name}</CardTitle>
                    <CardDescription className="text-base font-medium">
                      {mockStockData.ticker}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="secondary"
                    className={mockStockData.isPositive
                      ? 'bg-emerald-500/15 text-emerald-700'
                      : 'bg-red-500/15 text-red-700'
                    }
                  >
                    {mockStockData.isPositive ? (
                      <TrendingUp className="mr-1 h-3 w-3" />
                    ) : (
                      <TrendingDown className="mr-1 h-3 w-3" />
                    )}
                    {mockStockData.isPositive ? '+' : ''}{mockStockData.changePercent}%
                  </Badge>
                </div>
                <div className="flex items-baseline gap-3 pt-2">
                  <span className="text-4xl font-bold">${mockStockData.price.toFixed(2)}</span>
                  <span className={`flex items-center text-sm font-medium ${
                    mockStockData.isPositive ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {mockStockData.isPositive ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    ${Math.abs(mockStockData.change).toFixed(2)} today
                  </span>
                </div>
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
                <MetricCard label="EBITDA" value={mockMetrics.ebitda.value} status={mockMetrics.ebitda.status} />
                <Separator />
                <MetricCard label="P/E Ratio" value={mockMetrics.peRatio.value} status={mockMetrics.peRatio.status} />
                <Separator />
                <MetricCard label="Debt to Equity" value={mockMetrics.debtToEquity.value} status={mockMetrics.debtToEquity.status} />
                <Separator />
                <MetricCard label="Current Ratio" value={mockMetrics.currentRatio.value} status={mockMetrics.currentRatio.status} />
                <Separator />
                <MetricCard label="Gross Margin" value={mockMetrics.grossMargin.value} status={mockMetrics.grossMargin.status} />
                <Separator />
                <MetricCard label="Operating Margin" value={mockMetrics.operatingMargin.value} status={mockMetrics.operatingMargin.status} />
                <Separator />
                <MetricCard label="Free Cash Flow" value={mockMetrics.freeCashFlow.value} status={mockMetrics.freeCashFlow.status} />
                <Separator />
                <MetricCard label="Revenue Growth (YoY)" value={mockMetrics.revenueGrowth.value} status={mockMetrics.revenueGrowth.status} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
