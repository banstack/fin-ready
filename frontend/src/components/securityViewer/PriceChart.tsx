import { useState, useRef, useCallback } from 'react'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Filler
)

interface PeriodOption {
  value: string
  label: string
  interval: string | undefined
}

interface ChartDataPoint {
  date: string
  price: number
}

interface PriceChartProps {
  periodOptions: PeriodOption[]
  period: string
  onPeriodChange: (period: string) => void
  chartData: ChartDataPoint[]
  isHistoricalLoading: boolean
}

export function PriceChart({
  periodOptions,
  period,
  onPeriodChange,
  chartData,
  isHistoricalLoading,
}: PriceChartProps) {
  const isPositiveTrend =
    chartData.length > 1 ? chartData[chartData.length - 1].price > chartData[0].price : true

  const periodChangePercent =
    chartData.length > 1
      ? ((chartData[chartData.length - 1].price - chartData[0].price) / chartData[0].price) * 100
      : null

  // Drag-range selection state
  const chartRef = useRef<ChartJS<'line'> | null>(null)
  const [dragStart, setDragStart] = useState<number | null>(null)
  const [dragEnd, setDragEnd] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<number | null>(null)

  const getIndexFromMouseX = useCallback(
    (clientX: number, currentTarget: HTMLDivElement): number => {
      const rect = currentTarget.getBoundingClientRect()
      const x = clientX - rect.left
      const chart = chartRef.current
      if (chart && chart.scales?.x) {
        const scale = chart.scales.x
        const raw = ((x - scale.left) / (scale.right - scale.left)) * (chartData.length - 1)
        return Math.max(0, Math.min(chartData.length - 1, Math.round(raw)))
      }
      // Fallback: linear interpolation across the full overlay width
      const raw = (x / rect.width) * (chartData.length - 1)
      return Math.max(0, Math.min(chartData.length - 1, Math.round(raw)))
    },
    [chartData.length]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const idx = getIndexFromMouseX(e.clientX, e.currentTarget)
      dragStartRef.current = idx
      setDragStart(idx)
      setDragEnd(null)
      setIsDragging(true)
    },
    [getIndexFromMouseX]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDragging || dragStartRef.current === null) return
      const idx = getIndexFromMouseX(e.clientX, e.currentTarget)
      setDragEnd(idx)
    },
    [isDragging, getIndexFromMouseX]
  )

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDragging) return
      const idx = getIndexFromMouseX(e.clientX, e.currentTarget)
      const start = dragStartRef.current ?? idx
      // If user just clicked without dragging (same index), clear selection
      if (start === idx) {
        setDragStart(null)
        setDragEnd(null)
      } else {
        setDragStart(Math.min(start, idx))
        setDragEnd(Math.max(start, idx))
      }
      setIsDragging(false)
      dragStartRef.current = null
    },
    [isDragging, getIndexFromMouseX]
  )

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      // Commit whatever range we have rather than discarding on leave
      if (dragStartRef.current !== null && dragEnd !== null) {
        const s = Math.min(dragStartRef.current, dragEnd)
        const e2 = Math.max(dragStartRef.current, dragEnd)
        setDragStart(s)
        setDragEnd(e2)
      } else {
        setDragStart(null)
        setDragEnd(null)
      }
      setIsDragging(false)
      dragStartRef.current = null
    }
  }, [isDragging, dragEnd])

  const clearSelection = useCallback(() => {
    setDragStart(null)
    setDragEnd(null)
  }, [])

  // Normalise so selStart <= selEnd regardless of drag direction
  const selStart =
    dragStart !== null && dragEnd !== null ? Math.min(dragStart, dragEnd) : dragStart
  const selEnd =
    dragStart !== null && dragEnd !== null ? Math.max(dragStart, dragEnd) : dragEnd

  // Pixel-percent positions for the selection highlight overlay
  const selStartPct =
    selStart !== null && chartData.length > 1
      ? (selStart / (chartData.length - 1)) * 100
      : null
  const selEndPct =
    selEnd !== null && chartData.length > 1
      ? (selEnd / (chartData.length - 1)) * 100
      : null

  // Selection summary values (only shown when a real range is selected)
  const selectionSummary =
    selStart !== null &&
    selEnd !== null &&
    selStart !== selEnd &&
    chartData[selStart] &&
    chartData[selEnd]
      ? (() => {
          const priceA = chartData[selStart].price
          const priceB = chartData[selEnd].price
          const delta = priceB - priceA
          const pct = (delta / priceA) * 100
          return {
            dateFrom: chartData[selStart].date,
            dateTo: chartData[selEnd].date,
            delta,
            pct,
            isPositive: delta >= 0,
          }
        })()
      : null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              Price History
              {periodChangePercent !== null && (
                <span
                  className={`text-sm font-medium ${
                    periodChangePercent >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {periodChangePercent >= 0 ? '+' : ''}
                  {periodChangePercent.toFixed(2)}%
                </span>
              )}
            </CardTitle>
            <CardDescription>Historical price performance</CardDescription>
          </div>
          <div className="flex gap-1">
            {periodOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onPeriodChange(opt.value)}
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
            <div className="relative h-full w-full">
              <Line
                ref={chartRef}
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
                        label: (context) => `$${(context.parsed.y ?? 0).toFixed(2)}`,
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

              {/* Drag-selection highlight */}
              {selStartPct !== null && selEndPct !== null && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 bg-indigo-500/20 border-x border-indigo-400/60"
                  style={{
                    left: `${selStartPct}%`,
                    width: `${selEndPct - selStartPct}%`,
                  }}
                />
              )}

              {/* Transparent mouse-event overlay */}
              <div
                aria-label="Drag to select a price range"
                role="presentation"
                className="absolute inset-0 cursor-crosshair z-10"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </div>

        {/* Selection summary pill */}
        {selectionSummary && (
          <div className="mt-3 flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
            <span className="text-muted-foreground tabular-nums">
              {selectionSummary.dateFrom}
              <span className="mx-1.5 text-muted-foreground/50">→</span>
              {selectionSummary.dateTo}
            </span>
            <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
            <span
              className={`font-semibold tabular-nums ${
                selectionSummary.isPositive ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {selectionSummary.isPositive ? '+' : ''}$
              {selectionSummary.delta.toFixed(2)}
            </span>
            <span
              className={`tabular-nums ${
                selectionSummary.isPositive ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              ({selectionSummary.isPositive ? '+' : ''}
              {selectionSummary.pct.toFixed(2)}%)
            </span>
            <button
              onClick={clearSelection}
              aria-label="Clear selection"
              className="ml-auto rounded-full p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-3.5 w-3.5"
                aria-hidden="true"
              >
                <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
              </svg>
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
