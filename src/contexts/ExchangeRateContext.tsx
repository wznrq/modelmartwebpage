import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getExchangeRate } from '@/utils/formatPrice'

interface ExchangeRateContextType {
  exchangeRate: number
  isLoading: boolean
}

const ExchangeRateContext = createContext<ExchangeRateContextType>({
  exchangeRate: 7.2, // Default fallback
  isLoading: true,
})

export function ExchangeRateProvider({ children }: { children: ReactNode }) {
  const [exchangeRate, setExchangeRate] = useState<number>(7.2)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getExchangeRate().then((rate) => {
      setExchangeRate(rate)
      setIsLoading(false)
    })
  }, [])

  return (
    <ExchangeRateContext.Provider value={{ exchangeRate, isLoading }}>
      {children}
    </ExchangeRateContext.Provider>
  )
}

export function useExchangeRate() {
  return useContext(ExchangeRateContext)
}
