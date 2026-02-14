import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface StockHeaderProps {
  shortName: string
  symbol: string
  regularMarketPrice: number
  regularMarketChange: number
  regularMarketChangePercent: number
  longBusinessSummary: string
}

export function StockHeader({
  shortName,
  symbol,
  regularMarketPrice,
  regularMarketChange,
  regularMarketChangePercent,
  longBusinessSummary,
}: StockHeaderProps) {
  const isPositive = regularMarketChangePercent > 0

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">{shortName}</CardTitle>
            <CardDescription className="text-base font-medium">{symbol}</CardDescription>
          </div>
          <Badge
            variant="secondary"
            className={isPositive ? 'bg-emerald-500/15 text-emerald-700' : 'bg-red-500/15 text-red-700'}
          >
            {isPositive ? (
              <TrendingUp className="mr-1 h-3 w-3" />
            ) : (
              <TrendingDown className="mr-1 h-3 w-3" />
            )}
            {isPositive ? '+' : ''}
            {Math.abs(regularMarketChangePercent).toFixed(3)}%
          </Badge>
        </div>

        <div className="flex items-baseline gap-3 pt-2">
          <span className="text-4xl font-bold">${regularMarketPrice}</span>
          <span
            className={`flex items-center text-sm font-medium ${
              isPositive ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownRight className="h-4 w-4" />
            )}
            ${Math.abs(regularMarketChange).toFixed(2)} today
          </span>
        </div>

        <div className="mt-3">{longBusinessSummary}</div>
      </CardHeader>
    </Card>
  )
}
