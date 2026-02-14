import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { formatBillions } from '@/lib/utils'
import {
  type HealthStatus,
  statusColors,
  statusLabels,
  calculateHealthStatus,
  metricInfo,
} from '@/lib/metricConfig'

// ── MetricCard ────────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string
  value: string
  status: HealthStatus
}

function MetricCard({ label, value, status }: MetricCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const info = metricInfo[label]

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="py-3 space-y-3">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors cursor-pointer">
            <div className="flex-1 space-y-1 text-left">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-lg font-semibold">{value}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={statusColors[status]}>
                {statusLabels[status]}
              </Badge>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                  isOpen ? 'transform rotate-180' : ''
                }`}
              />
            </div>
          </button>
        </CollapsibleTrigger>

        {info && (
          <CollapsibleContent className="space-y-3 pt-2">
            <div className="rounded-lg bg-muted/50 p-3 space-y-3">
              <div>
                <h4 className="text-xs font-semibold text-foreground mb-1">Description</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{info.description}</p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-foreground mb-2">Formula</h4>
                <div className="rounded bg-background border border-border p-2">
                  <code className="text-xs font-mono text-foreground">{info.formula}</code>
                </div>
              </div>

              <Separator className="my-2" />

              <div>
                <h4 className="text-xs font-semibold text-foreground mb-2">Health Thresholds</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-emerald-500/15 text-emerald-700 border-emerald-500/20 text-xs"
                    >
                      Healthy
                    </Badge>
                    <span className="text-xs text-muted-foreground">{info.thresholds.healthy}</span>
                  </div>
                  {info.thresholds.moderate !== 'N/A' && (
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-amber-500/15 text-amber-700 border-amber-500/20 text-xs"
                      >
                        Moderate
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {info.thresholds.moderate}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-red-500/15 text-red-700 border-red-500/20 text-xs"
                    >
                      Risky
                    </Badge>
                    <span className="text-xs text-muted-foreground">{info.thresholds.risky}</span>
                  </div>
                </div>
              </div>

              <Separator className="my-2" />

              <div>
                <h4 className="text-xs font-semibold text-emerald-700 mb-1">Healthy Range</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{info.healthy}</p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-red-700 mb-1">Concerning Signs</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{info.unhealthy}</p>
              </div>
            </div>
          </CollapsibleContent>
        )}
      </div>
    </Collapsible>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function valueCheck(value: string): string {
  if (value === '0B' || value === '0%') {
    return 'N/A'
  }
  return value ? value : 'N/A'
}

function getMetricCards(data: Record<string, unknown>) {
  return [
    {
      label: 'EBITDA',
      value: formatBillions(data.ebitda as number),
      status: calculateHealthStatus('EBITDA', data.ebitda as number),
    },
    {
      label: 'P/E Ratio',
      value: data.trailingPE ? Math.abs(data.trailingPE as number).toFixed(2) : null,
      status: calculateHealthStatus('P/E Ratio', data.trailingPE as number),
    },
    {
      label: 'Debt to Equity',
      value: data.debtToEquity,
      status: calculateHealthStatus('Debt to Equity', data.debtToEquity as number),
    },
    {
      label: 'Current Ratio',
      value: data.currentRatio,
      status: calculateHealthStatus('Current Ratio', data.currentRatio as number),
    },
    {
      label: 'Gross Margin',
      value: data.grossMargins
        ? `${((data.grossMargins as number) * 100).toFixed(2)}%`
        : null,
      status: calculateHealthStatus('Gross Margin', data.grossMargins as number),
    },
    {
      label: 'Operating Margin',
      value: data.operatingMargins
        ? `${Math.abs((data.operatingMargins as number) * 100).toFixed(2)}%`
        : null,
      status: calculateHealthStatus('Operating Margin', data.operatingMargins as number),
    },
    {
      label: 'Free Cash Flow',
      value: formatBillions(data.freeCashflow as number),
      status: calculateHealthStatus('Free Cash Flow', data.freeCashflow as number),
    },
    {
      label: 'Revenue Growth (YoY)',
      value: data.revenueGrowth
        ? `${Math.abs((data.revenueGrowth as number) * 100).toFixed(2)}%`
        : null,
      status: calculateHealthStatus('Revenue Growth (YoY)', data.revenueGrowth as number),
    },
  ]
}

// ── FinancialHealth ───────────────────────────────────────────────────────────

interface FinancialHealthProps {
  data: Record<string, unknown>
}

export function FinancialHealth({ data }: FinancialHealthProps) {
  const metrics = getMetricCards(data)

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-lg">Financial Health</CardTitle>
        <CardDescription>Key metrics and indicators</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {metrics.map((metric, index, arr) => (
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
  )
}
