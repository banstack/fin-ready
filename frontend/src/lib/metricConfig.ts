export type HealthStatus = 'healthy' | 'moderate' | 'warning'

export const statusColors: Record<HealthStatus, string> = {
  healthy: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/20',
  moderate: 'bg-amber-500/15 text-amber-700 border-amber-500/20',
  warning: 'bg-red-500/15 text-red-700 border-red-500/20',
}

export const statusLabels: Record<HealthStatus, string> = {
  healthy: 'Healthy',
  moderate: 'Moderate',
  warning: 'Risky',
}

export const calculateHealthStatus = (label: string, rawValue: number | string | null | undefined): HealthStatus => {
  if (rawValue === null || rawValue === undefined) return 'moderate'

  const numValue = typeof rawValue === 'string' ? parseFloat(rawValue) : rawValue
  if (isNaN(numValue)) return 'moderate'

  switch (label) {
    case "EBITDA":
      // Positive EBITDA is healthy
      return numValue > 0 ? 'healthy' : 'warning'

    case "P/E Ratio":
      // 15-25 is healthy, 10-15 or 25-40 is moderate, outside is warning
      if (numValue >= 15 && numValue <= 25) return 'healthy'
      if ((numValue >= 10 && numValue < 15) || (numValue > 25 && numValue <= 40)) return 'moderate'
      return 'warning'

    case "Debt to Equity":
      // <1.0 is healthy, 1.0-2.0 is moderate, >2.0 is warning
      if (numValue < 1.0) return 'healthy'
      if (numValue <= 2.0) return 'moderate'
      return 'warning'

    case "Current Ratio":
      // 1.5-3.0 is healthy, 1.0-1.5 or 3.0-4.0 is moderate, outside is warning
      if (numValue >= 1.5 && numValue <= 3.0) return 'healthy'
      if ((numValue >= 1.0 && numValue < 1.5) || (numValue > 3.0 && numValue <= 4.0)) return 'moderate'
      return 'warning'

    case "Gross Margin": {
      // >40% is healthy, 20-40% is moderate, <20% is warning
      const grossMarginPercent = typeof rawValue === 'number' && rawValue < 1 ? numValue * 100 : numValue
      if (grossMarginPercent > 40) return 'healthy'
      if (grossMarginPercent >= 20) return 'moderate'
      return 'warning'
    }

    case "Operating Margin": {
      // >15% is healthy, 5-15% is moderate, <5% is warning
      const opMarginPercent = typeof rawValue === 'number' && rawValue < 1 ? numValue * 100 : numValue
      if (opMarginPercent > 15) return 'healthy'
      if (opMarginPercent >= 5) return 'moderate'
      return 'warning'
    }

    case "Free Cash Flow":
      // Positive is healthy, slightly positive is moderate, negative is warning
      if (numValue > 1000000000) return 'healthy' // >1B
      if (numValue > 0) return 'moderate'
      return 'warning'

    case "Revenue Growth (YoY)": {
      // >10% is healthy, 3-10% is moderate, <3% is warning
      const revenueGrowthPercent = typeof rawValue === 'number' && rawValue < 1 ? numValue * 100 : numValue
      if (revenueGrowthPercent > 10) return 'healthy'
      if (revenueGrowthPercent >= 3) return 'moderate'
      return 'warning'
    }

    default:
      return 'moderate'
  }
}

export const metricInfo: Record<string, {
  description: string;
  formula: string;
  thresholds: { healthy: string; moderate: string; risky: string };
  healthy: string;
  unhealthy: string;
}> = {
  "EBITDA": {
    description: "Earnings Before Interest, Taxes, Depreciation and Amortization",
    formula: "Net Income + Interest + Taxes + Depreciation + Amortization",
    thresholds: {
      healthy: "Positive values",
      moderate: "N/A",
      risky: "Negative values"
    },
    healthy: "Positive and growing EBITDA indicates strong operational profitability. Higher values relative to industry peers suggest better operational efficiency.",
    unhealthy: "Negative or declining EBITDA suggests operational losses or deteriorating business performance. This may indicate the company is not generating sufficient cash from operations."
  },
  "P/E Ratio": {
    description: "Price-to-Earnings Ratio",
    formula: "Stock Price ÷ Earnings Per Share (EPS)",
    thresholds: {
      healthy: "15 - 25",
      moderate: "10 - 15 or 25 - 40",
      risky: "< 10 or > 40"
    },
    healthy: "A P/E ratio between 15-25 is generally considered healthy for most industries. Lower P/E may indicate undervaluation or stable growth expectations.",
    unhealthy: "Very high P/E (>40) may suggest overvaluation or unrealistic growth expectations. Very low P/E (<10) could indicate fundamental problems or market concerns about future earnings."
  },
  "Debt to Equity": {
    description: "Measures financial leverage by comparing total debt to shareholders' equity",
    formula: "Total Liabilities ÷ Shareholders' Equity",
    thresholds: {
      healthy: "< 1.0",
      moderate: "1.0 - 2.0",
      risky: "> 2.0"
    },
    healthy: "A ratio below 1.0 is generally healthy, indicating the company has more equity than debt. Ratios between 1.0-2.0 are acceptable for many industries.",
    unhealthy: "Ratios above 2.0 indicate high leverage and financial risk. The company may struggle to meet debt obligations during downturns. Very high ratios (>3.0) are concerning."
  },
  "Current Ratio": {
    description: "Measures ability to pay short-term obligations with current assets",
    formula: "Current Assets ÷ Current Liabilities",
    thresholds: {
      healthy: "1.5 - 3.0",
      moderate: "1.0 - 1.5 or 3.0 - 4.0",
      risky: "< 1.0 or > 4.0"
    },
    healthy: "A ratio between 1.5-3.0 is generally healthy, indicating the company can easily cover short-term obligations. It suggests good liquidity and financial flexibility.",
    unhealthy: "A ratio below 1.0 is concerning, indicating the company may struggle to pay short-term obligations. Ratios above 3.0 might suggest inefficient use of assets."
  },
  "Gross Margin": {
    description: "Percentage of revenue remaining after subtracting cost of goods sold",
    formula: "(Revenue - Cost of Goods Sold) ÷ Revenue × 100%",
    thresholds: {
      healthy: "> 40%",
      moderate: "20% - 40%",
      risky: "< 20%"
    },
    healthy: "Higher margins (>40%) indicate strong pricing power and efficient production. Stable or improving margins suggest competitive advantages.",
    unhealthy: "Low margins (<20%) or declining trends suggest pricing pressure, rising costs, or increased competition. This limits profitability and flexibility."
  },
  "Operating Margin": {
    description: "Percentage of revenue remaining after operating expenses",
    formula: "Operating Income ÷ Revenue × 100%",
    thresholds: {
      healthy: "> 15%",
      moderate: "5% - 15%",
      risky: "< 5%"
    },
    healthy: "Margins above 15% are generally strong. Positive and stable margins indicate efficient operations and good cost control.",
    unhealthy: "Negative margins indicate operating losses. Margins below 5% or declining trends suggest operational inefficiencies, high costs, or competitive pressures."
  },
  "Free Cash Flow": {
    description: "Cash available after maintaining or expanding the asset base",
    formula: "Operating Cash Flow - Capital Expenditures",
    thresholds: {
      healthy: "> $1B",
      moderate: "Positive but < $1B",
      risky: "Negative"
    },
    healthy: "Positive and growing FCF indicates the company generates cash for dividends, buybacks, or growth investments. This demonstrates financial health and sustainability.",
    unhealthy: "Negative FCF means the company is spending more than it generates, potentially requiring external financing. Persistent negative FCF raises sustainability concerns."
  },
  "Revenue Growth (YoY)": {
    description: "Year-over-year percentage change in total revenue",
    formula: "(Current Revenue - Prior Revenue) ÷ Prior Revenue × 100%",
    thresholds: {
      healthy: "> 10%",
      moderate: "3% - 10%",
      risky: "< 3%"
    },
    healthy: "Growth above 10% annually is strong for established companies. Consistent growth indicates market share gains and business momentum.",
    unhealthy: "Negative growth or significant deceleration may indicate losing market share, market saturation, or competitive challenges. Growth below 3% may barely keep pace with inflation."
  }
}
