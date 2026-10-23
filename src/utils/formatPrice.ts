const EXCHANGE_CACHE_KEY = 'modelmart-exchange-rate'
const EXCHANGE_CACHE_DURATION = 60 * 60 * 1000 // 1 hour in ms

interface CachedExchangeRate {
  rate: number
  timestamp: number
}

/**
 * Get exchange rate from cache or fetch from API
 * Returns CNY per USD (e.g., 7.2 means 1 USD = 7.2 CNY)
 */
export async function getExchangeRate(): Promise<number> {
  // Check cache first
  const cached = localStorage.getItem(EXCHANGE_CACHE_KEY)
  if (cached) {
    try {
      const { rate, timestamp }: CachedExchangeRate = JSON.parse(cached)
      if (Date.now() - timestamp < EXCHANGE_CACHE_DURATION) {
        return rate
      }
    } catch {
      // Invalid cache, continue to fetch
    }
  }

  try {
    // Fetch from free exchange rate API
    const response = await fetch('https://open.er-api.com/v6/latest/USD')
    if (!response.ok) throw new Error('Failed to fetch exchange rate')

    const data = await response.json()
    const rate = data.rates?.CNY

    if (rate && rate > 0) {
      // Cache the rate
      const cacheData: CachedExchangeRate = { rate, timestamp: Date.now() }
      localStorage.setItem(EXCHANGE_CACHE_KEY, JSON.stringify(cacheData))
      return rate
    }
  } catch (error) {
    console.warn('Failed to fetch exchange rate, using fallback:', error)
  }

  // Fallback to hardcoded rate if API fails
  return 7.2
}

/**
 * Convert CNY to USD
 */
export function cnyToUsd(cny: number, rate: number): number {
  return Math.round((cny / rate) * 100) / 100
}

/**
 * Format price with currency symbol based on language
 * - zh-CN, zh-TW: display in CNY (¥)
 * - en: display in USD ($)
 */
export function formatPrice(priceInCNY: number, currency: '¥' | '$', exchangeRate: number = 7.2): string {
  if (priceInCNY === 0) return currency === '$' ? 'Free' : '¥0'

  if (currency === '$') {
    const usdPrice = cnyToUsd(priceInCNY, exchangeRate)
    return `$${usdPrice}`
  }

  return `¥${priceInCNY}`
}

/**
 * Get currency symbol based on language
 */
export function getCurrencySymbol(language: string): '¥' | '$' {
  return language === 'en' ? '$' : '¥'
}
