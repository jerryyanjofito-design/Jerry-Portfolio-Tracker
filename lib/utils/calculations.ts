import type {
  AssetHolding,
  CashAccount,
  PortfolioCalculations,
  AllocationBreakdown,
  AssetAllocationItem,
} from '@/lib/supabase/types'

// ============================================
// PORTFOLIO CALCULATIONS
// ============================================

/**
 * Calculate total portfolio metrics
 */
export async function calculatePortfolioMetrics(
  assets: AssetHolding[],
  cashAccounts: CashAccount[],
  fxRates: Record<string, number>
): Promise<PortfolioCalculations> {
  // Calculate total assets value in IDR
  const totalAssetsValue = assets.reduce((total, asset) => {
    const value = asset.current_value || 0
    // Convert to IDR if not already
    if (asset.price_currency && asset.price_currency !== 'IDR') {
      const rate = fxRates[`${asset.price_currency}IDR`] || 1
      return total + (value * rate)
    }
    return total + value
  }, 0)

  // Calculate total cash value in IDR
  const totalCashValue = cashAccounts.reduce((total, account) => {
    const balance = Number(account.balance)
    // Convert to IDR if not already
    if (account.currency !== 'IDR') {
      const rate = fxRates[`${account.currency}IDR`] || 1
      return total + (balance * rate)
    }
    return total + balance
  }, 0)

  // Calculate total net worth
  const totalNetWorth = totalAssetsValue + totalCashValue

  // Calculate total cost basis
  const totalCostBasis = assets.reduce((total, asset) => {
    return total + (asset.cost_basis || 0)
  }, 0)

  // Calculate total gain/loss
  const totalGainLoss = assets.reduce((total, asset) => {
    return total + (asset.gain_loss || 0)
  }, 0)

  // Calculate total return percentage
  const totalReturnPercentage = totalCostBasis > 0
    ? ((totalGainLoss / totalCostBasis) * 100)
    : 0

  // Calculate allocation breakdown
  const allocation = calculateAllocation(assets, cashAccounts, fxRates)

  return {
    totalAssetsValue,
    totalCashValue,
    totalNetWorth,
    totalCostBasis,
    totalGainLoss,
    totalReturnPercentage,
    allocation,
  }
}

/**
 * Calculate asset allocation by category
 */
export function calculateAllocation(
  assets: AssetHolding[],
  cashAccounts: CashAccount[],
  fxRates: Record<string, number>
): AllocationBreakdown {
  const allocation: AllocationBreakdown = {
    Stocks: 0,
    ETFs: 0,
    Crypto: 0,
    Gold: 0,
    Bonds: 0,
    PrivateInvestment: 0,
    Cash: 0,
  }

  // Sum up assets by type
  assets.forEach(asset => {
    const value = asset.current_value || 0
    let valueInIDR = value

    // Convert to IDR if needed
    if (asset.price_currency && asset.price_currency !== 'IDR') {
      const rate = fxRates[`${asset.price_currency}IDR`] || 1
      valueInIDR = value * rate
    }

    switch (asset.security_type) {
      case 'Stocks':
        allocation.Stocks += valueInIDR
        break
      case 'ETFs':
        allocation.ETFs += valueInIDR
        break
      case 'Crypto':
        allocation.Crypto += valueInIDR
        break
      case 'Gold':
        allocation.Gold += valueInIDR
        break
      case 'Bonds':
        allocation.Bonds += valueInIDR
        break
      case 'Private Investment':
        allocation.PrivateInvestment += valueInIDR
        break
    }
  })

  // Sum up cash
  cashAccounts.forEach(account => {
    const balance = Number(account.balance)
    let balanceInIDR = balance

    // Convert to IDR if needed
    if (account.currency !== 'IDR') {
      const rate = fxRates[`${account.currency}IDR`] || 1
      balanceInIDR = balance * rate
    }

    allocation.Cash += balanceInIDR
  })

  return allocation
}

/**
 * Convert allocation to chart data format
 */
export function getAllocationChartData(allocation: AllocationBreakdown): AssetAllocationItem[] {
  const total = Object.values(allocation).reduce((sum, value) => sum + value, 0)

  const colors: Record<string, string> = {
    Stocks: '#3B82F6',
    ETFs: '#10B981',
    Crypto: '#8B5CF6',
    Gold: '#F59E0B',
    Bonds: '#EF4444',
    PrivateInvestment: '#6366F1',
    Cash: '#9CA3AF',
  }

  return Object.entries(allocation)
    .filter(([_, value]) => value > 0)
    .map(([category, value]) => ({
      category: category === 'PrivateInvestment' ? 'Private Investment' : category,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
      color: colors[category] || '#9CA3AF',
    }))
    .sort((a, b) => b.value - a.value)
}

/**
 * Calculate goal progress percentage
 */
export function calculateGoalProgress(currentNetWorth: number, goalAmount: number = 15000000000): number {
  return Math.min((currentNetWorth / goalAmount) * 100, 100)
}

/**
 * Calculate daily change
 */
export function calculateDailyChange(currentNetWorth: number, previousNetWorth: number): {
  change: number
  percentage: number
} {
  const change = currentNetWorth - previousNetWorth
  const percentage = previousNetWorth > 0 ? (change / previousNetWorth) * 100 : 0

  return { change, percentage }
}

/**
 * Calculate return on investment for an asset
 */
export function calculateROI(currentPrice: number, purchasePrice: number): {
  roi: number
  roiPercentage: number
} {
  const roi = currentPrice - purchasePrice
  const roiPercentage = purchasePrice > 0 ? (roi / purchasePrice) * 100 : 0

  return { roi, roiPercentage }
}

/**
 * Calculate portfolio performance over a period
 */
export function calculatePeriodPerformance(
  startValue: number,
  endValue: number,
  periodDays: number
): {
  change: number
  changePercentage: number
  annualizedReturn: number
} {
  const change = endValue - startValue
  const changePercentage = startValue > 0 ? (change / startValue) * 100 : 0

  // Annualized return (CAGR)
  let annualizedReturn = 0
  if (startValue > 0 && endValue > 0 && periodDays > 0) {
    const years = periodDays / 365
    annualizedReturn = (Math.pow(endValue / startValue, 1 / years) - 1) * 100
  }

  return {
    change,
    changePercentage,
    annualizedReturn,
  }
}

/**
 * Calculate total value for an asset
 */
export function calculateAssetValue(shares: number, price: number): number {
  return shares * price
}

/**
 * Calculate cost basis for an asset
 */
export function calculateCostBasis(shares: number, purchasePrice: number): number {
  return shares * purchasePrice
}

/**
 * Convert currency amount
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  fxRates: Record<string, number>
): number {
  if (fromCurrency === toCurrency) return amount

  const rateKey = `${fromCurrency.toUpperCase()}${toCurrency.toUpperCase()}`
  const rate = fxRates[rateKey]

  if (!rate) {
    console.warn(`No FX rate found for ${rateKey}`)
    return amount
  }

  return amount * rate
}

/**
 * Format number as currency
 */
export function formatCurrency(
  amount: number,
  currency: string = 'IDR',
  locale: string = 'id-ID'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format large numbers with abbreviations
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1e9) {
    return `${(num / 1e9).toFixed(1)}B`
  }
  if (num >= 1e6) {
    return `${(num / 1e6).toFixed(1)}M`
  }
  if (num >= 1e3) {
    return `${(num / 1e3).toFixed(1)}K`
  }
  return num.toFixed(0)
}

/**
 * Format percentage
 */
export function formatPercentage(percentage: number, decimals: number = 2): string {
  const sign = percentage >= 0 ? '+' : ''
  return `${sign}${percentage.toFixed(decimals)}%`
}

/**
 * Check if value is positive gain
 */
export function isPositiveGain(value: number): boolean {
  return value > 0
}

/**
 * Get top performing assets
 */
export function getTopPerformers(
  assets: AssetHolding[],
  limit: number = 5
): AssetHolding[] {
  return [...assets]
    .filter(asset => asset.current_value !== null && asset.return_percentage !== null)
    .sort((a, b) => b.return_percentage - a.return_percentage)
    .slice(0, limit)
}

/**
 * Get worst performing assets
 */
export function getWorstPerformers(
  assets: AssetHolding[],
  limit: number = 5
): AssetHolding[] {
  return [...assets]
    .filter(asset => asset.current_value !== null && asset.return_percentage !== null)
    .sort((a, b) => a.return_percentage - b.return_percentage)
    .slice(0, limit)
}

/**
 * Calculate portfolio diversification score (0-100)
 */
export function calculateDiversificationScore(allocation: AllocationBreakdown): number {
  const values = Object.values(allocation).filter(v => v > 0)
  const total = values.reduce((sum, v) => sum + v, 0)

  if (total === 0 || values.length === 0) return 0

  // Calculate concentration using Herfindahl-Hirschman Index (HHI)
  const hhi = values.reduce((sum, v) => {
    const share = v / total
    return sum + (share * share)
  }, 0)

  // Convert HHI to diversification score (0-100)
  // Lower HHI = more diversified
  const score = (1 - hhi) * 100

  return Math.max(0, Math.min(100, score))
}

/**
 * Get category value percentage
 */
export function getCategoryPercentage(
  categoryValue: number,
  totalValue: number
): number {
  if (totalValue === 0) return 0
  return (categoryValue / totalValue) * 100
}

/**
 * Calculate weighted average return
 */
export function calculateWeightedAverageReturn(assets: AssetHolding[]): number {
  let totalValue = 0
  let weightedReturn = 0

  assets.forEach(asset => {
    if (asset.current_value !== null && asset.return_percentage !== null && asset.current_value > 0) {
      totalValue += asset.current_value
      weightedReturn += asset.current_value * asset.return_percentage
    }
  })

  if (totalValue === 0) return 0
  return weightedReturn / totalValue
}
