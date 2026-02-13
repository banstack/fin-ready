import { useNavigate } from 'react-router-dom'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TickerSearch } from '@/components/TickerSearch'
import { Navbar } from '@/components/Navbar'
import { useSecurity } from '@/hooks/useSecurityHooks'
import { availableTickers } from '@/constant'

const previewTickers = {
  Technology: availableTickers.technology.slice(0, 3),
  'Financial Services': availableTickers['financial-services'].slice(0, 3),
}

interface SecurityPreviewCardProps {
  ticker: string
  onSelect: (ticker: string) => void
}

function SecurityPreviewCard({ ticker, onSelect }: SecurityPreviewCardProps) {
  const { data, isLoading } = useSecurity(ticker)

  if (isLoading) {
    return (
      <Card className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-1 animate-pulse">
        <CardHeader className="pb-3">
          <div className="h-4 w-16 bg-muted rounded" />
          <div className="h-3 w-32 bg-muted rounded mt-1" />
        </CardHeader>
        <CardContent>
          <div className="h-7 w-24 bg-muted rounded" />
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const isPositive = data.regularMarketChangePercent > 0

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-1"
      onClick={() => onSelect(ticker)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{data.symbol}</CardTitle>
          <Badge
            variant="outline"
            className={
              isPositive
                ? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/20'
                : 'bg-red-500/15 text-red-700 border-red-500/20'
            }
          >
            {isPositive ? (
              <TrendingUp className="mr-1 h-3 w-3" />
            ) : (
              <TrendingDown className="mr-1 h-3 w-3" />
            )}
            {isPositive ? '+' : ''}
            {data.regularMarketChangePercent.toFixed(2)}%
          </Badge>
        </div>
        <CardDescription className="text-sm truncate">{data.shortName}</CardDescription>
      </CardHeader>
      <CardContent>
        <span className="text-2xl font-bold">${data.regularMarketPrice}</span>
        <span
          className={`ml-2 text-sm font-medium ${
            isPositive ? 'text-emerald-600' : 'text-red-600'
          }`}
        >
          {isPositive ? '+' : ''}
          {data.regularMarketChange.toFixed(2)}
        </span>
      </CardContent>
    </Card>
  )
}

export function Markets() {
  const navigate = useNavigate()

  function handleSelectTicker(ticker: string) {
    navigate(`/app/${ticker}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="app" />

      <div className="container px-4 md:px-6 lg:px-8 py-6 md:py-10">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Markets Header */}
          <div className="text-center space-y-3 pt-8">
            <h1 className="text-4xl font-bold tracking-tight">Markets</h1>
            <p className="text-muted-foreground text-lg">
              Search for a ticker or browse top securities by sector
            </p>
          </div>

          {/* Centered Search Bar */}
          <div className="flex justify-center">
            <TickerSearch
              onSelect={handleSelectTicker}
              className="w-full max-w-lg"
              dropdownDirection="down"
            />
          </div>

          {/* Sector Preview Cards */}
          <div className="space-y-10 pt-4">
            {Object.entries(previewTickers).map(([sector, tickers]) => (
              <div key={sector} className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight">{sector}</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {tickers.map((ticker) => (
                    <SecurityPreviewCard
                      key={ticker}
                      ticker={ticker}
                      onSelect={handleSelectTicker}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
