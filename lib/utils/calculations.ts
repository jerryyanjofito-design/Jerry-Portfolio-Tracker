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

    // Handle assets without current market data (use purchase price as fallback)
    // Only count assets that have valid current values for accurate portfolio calculation
    if (value === null && asset.purchase_price) {
      const currencyCode = asset.price_currency || 'IDR'
      return total + (asset.purchase_price * (fxRates[`${currencyCode}IDR`] || 1)
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
    assetsBreakdown: {} as Record<string, number>,
    cashBreakdown: {} as Record<string, number>,
    allocationBreakdown: {} as Record<string, number>,
    assetCount: assets.length,
    cashAccountCount: cashAccounts.length,
  }
}