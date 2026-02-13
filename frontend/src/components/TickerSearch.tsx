import { useState, useRef, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { availableTickers, tickerNames } from '@/constant'
import { cn } from '@/lib/utils'

interface TickerSearchProps {
  onSelect: (ticker: string) => void
  placeholder?: string
  className?: string
  dropdownDirection?: 'up' | 'down'
}

interface TickerEntry {
  ticker: string
  name: string
  sector: string
}

// Flatten tickers into a searchable list
const allTickers: TickerEntry[] = Object.entries(availableTickers).flatMap(
  ([sector, tickers]) =>
    tickers.map((ticker) => ({
      ticker,
      name: tickerNames[ticker] ?? ticker,
      sector,
    }))
)

export function TickerSearch({ onSelect, placeholder = "Search by name or ticker (e.g. Nvidia, AAPL)", className, dropdownDirection = 'up' }: TickerSearchProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = query.trim().length === 0
    ? allTickers
    : allTickers.filter((entry) => {
        const q = query.toLowerCase()
        return (
          entry.ticker.toLowerCase().includes(q) ||
          entry.name.toLowerCase().includes(q)
        )
      })

  // Group filtered results by sector
  const grouped = filtered.reduce<Record<string, TickerEntry[]>>((acc, entry) => {
    const label = entry.sector === 'financial-services' ? 'Financial Services' : 'Technology'
    if (!acc[label]) acc[label] = []
    acc[label].push(entry)
    return acc
  }, {})

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(ticker: string) {
    setQuery('')
    setOpen(false)
    onSelect(ticker)
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
      <Input
        ref={inputRef}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="pl-10"
      />

      {open && (
        <div className={cn("absolute left-0 right-0 z-50 max-h-64 overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md", dropdownDirection === 'up' ? "bottom-full mb-1" : "top-full mt-1")}>
          {Object.keys(grouped).length === 0 ? (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              No results found
            </div>
          ) : (
            Object.entries(grouped).map(([sector, entries]) => (
              <div key={sector}>
                <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                  {sector}
                </div>
                {entries.map((entry) => (
                  <button
                    key={entry.ticker}
                    type="button"
                    className="flex w-full items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-muted/80 cursor-pointer"
                    onMouseDown={(e) => {
                      // Use mousedown to fire before blur closes the dropdown
                      e.preventDefault()
                      handleSelect(entry.ticker)
                    }}
                  >
                    <span className="font-medium w-14 text-left">{entry.ticker}</span>
                    <span className="text-muted-foreground truncate">{entry.name}</span>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
