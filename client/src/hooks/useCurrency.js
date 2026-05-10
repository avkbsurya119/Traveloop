import { useState, useEffect, useCallback, useMemo } from 'react'
import { currencyApi } from '../api/currency'

// Cache exchange rates
let ratesCache = null
let cacheTimestamp = 0
const CACHE_TTL = 3600000 // 1 hour

export function useCurrency(baseCurrency = 'USD') {
  const [rates, setRates] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchRates = async () => {
      try {
        // Check cache
        if (ratesCache && ratesCache.base === baseCurrency && Date.now() - cacheTimestamp < CACHE_TTL) {
          setRates(ratesCache)
          setLoading(false)
          return
        }

        setLoading(true)
        const { data } = await currencyApi.getRates(baseCurrency)
        ratesCache = data
        cacheTimestamp = Date.now()
        setRates(data)
        setError(null)
      } catch (err) {
        setError('Failed to fetch exchange rates')
        console.error('Currency fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRates()
  }, [baseCurrency])

  const convert = useCallback((amount, from, to) => {
    if (!rates || from === to) return amount

    // If 'from' is the base currency, just multiply
    if (from === rates.base) {
      return Math.round(amount * (rates.rates[to] || 1) * 100) / 100
    }

    // Convert to base first, then to target
    const inBase = amount / (rates.rates[from] || 1)
    return Math.round(inBase * (rates.rates[to] || 1) * 100) / 100
  }, [rates])

  const formatCurrency = useCallback((amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }, [])

  return {
    rates,
    loading,
    error,
    convert,
    formatCurrency
  }
}

export function useCurrencyConverter() {
  const [amount, setAmount] = useState('')
  const [from, setFrom] = useState('USD')
  const [to, setTo] = useState('EUR')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const doConvert = useCallback(async () => {
    if (!amount || isNaN(amount)) return

    setLoading(true)
    try {
      const { data } = await currencyApi.convert(Number(amount), from, to)
      setResult(data)
    } catch (err) {
      console.error('Conversion error:', err)
    } finally {
      setLoading(false)
    }
  }, [amount, from, to])

  const swap = useCallback(() => {
    setFrom(to)
    setTo(from)
    setResult(null)
  }, [from, to])

  return {
    amount,
    setAmount,
    from,
    setFrom,
    to,
    setTo,
    result,
    loading,
    convert: doConvert,
    swap
  }
}

// Currency symbols for common currencies
export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '\u20AC',
  GBP: '\u00A3',
  JPY: '\u00A5',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'CHF',
  CNY: '\u00A5',
  INR: '\u20B9',
  MXN: 'MX$',
  BRL: 'R$',
  KRW: '\u20A9',
  SGD: 'S$',
  HKD: 'HK$',
  THB: '\u0E3F',
  PHP: '\u20B1'
}

export function getCurrencySymbol(code) {
  return CURRENCY_SYMBOLS[code] || code
}
