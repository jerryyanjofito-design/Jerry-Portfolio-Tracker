/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

/**
 * Format number with specified decimals
 */
export function formatNumberDecimals(num: number, decimals: number = 2): string {
  return num.toFixed(decimals)
}

/**
 * Format percentage
 */
export function formatPercentage(num: number, decimals: number = 2): string {
  const sign = num >= 0 ? '+' : ''
  return `${sign}${num.toFixed(decimals)}%`
}

/**
 * Format as IDR currency
 */
export function formatIDR(num: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

/**
 * Format as USD currency
 */
export function formatUSD(num: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

/**
 * Format as SGD currency
 */
export function formatSGD(num: number): string {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

/**
 * Format currency based on code
 */
export function formatCurrency(num: number, currency: string): string {
  switch (currency.toUpperCase()) {
    case 'IDR':
      return formatIDR(num)
    case 'USD':
      return formatUSD(num)
    case 'SGD':
      return formatSGD(num)
    default:
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(num)
  }
}

/**
 * Format large number with abbreviation
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1e12) {
    return `${(num / 1e12).toFixed(1)}T`
  }
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
 * Format date
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

/**
 * Format date with time
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * Format date in short form (MM/DD/YYYY)
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  }).format(d)
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) {
    return 'just now'
  }
  if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  }
  if (hours < 24) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  }
  if (days < 7) {
    return `${days} day${days > 1 ? 's' : ''} ago`
  }
  if (days < 30) {
    return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`
  }
  if (days < 365) {
    return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`
  }
  return `${Math.floor(days / 365)} year${Math.floor(days / 365) > 1 ? 's' : ''} ago`
}

/**
 * Format time duration
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`
  }
  return `${secs}s`
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Convert to title case
 */
export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Format ticker symbol (uppercase)
 */
export function formatTicker(ticker: string): string {
  return ticker.toUpperCase()
}

/**
 * Format shares with appropriate decimals
 */
export function formatShares(shares: number): string {
  // For shares, use 8 decimals for crypto, 4 for stocks
  if (shares < 1) {
    return shares.toFixed(8)
  }
  return shares.toFixed(4)
}

/**
 * Format price with appropriate decimals
 */
export function formatPrice(price: number, currency: string = 'IDR'): string {
  // For crypto, show more decimals
  if (price < 1 && currency !== 'IDR') {
    return price.toFixed(8)
  }
  if (price < 100 && currency !== 'IDR') {
    return price.toFixed(6)
  }
  if (currency === 'IDR') {
    return formatIDR(price)
  }
  return formatNumberDecimals(price, 2)
}

/**
 * Get color class for positive/negative values
 */
export function getValueColorClass(value: number): string {
  if (value > 0) return 'text-green-600'
  if (value < 0) return 'text-red-600'
  return 'text-gray-600'
}

/**
 * Get arrow icon based on value
 */
export function getValueArrow(value: number): string {
  if (value > 0) return '↑'
  if (value < 0) return '↓'
  return '→'
}

/**
 * Format goal progress
 */
export function formatGoalProgress(current: number, goal: number): string {
  const percentage = Math.min((current / goal) * 100, 100)
  return `${percentage.toFixed(1)}%`
}
