import { useState, useEffect } from 'react'
import { currencyApi } from '../../api/currency'
import { ChevronDown, DollarSign } from 'lucide-react'

const POPULAR_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'INR']

export default function CurrencySelect({ value, onChange, className = '' }) {
  const [currencies, setCurrencies] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const { data } = await currencyApi.getSupportedCurrencies()
        setCurrencies(data)
      } catch (err) {
        console.error('Failed to fetch currencies:', err)
      }
    }
    fetchCurrencies()
  }, [])

  const selected = currencies.find(c => c.code === value)

  const filtered = currencies.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const popular = filtered.filter(c => POPULAR_CURRENCIES.includes(c.code))
  const others = filtered.filter(c => !POPULAR_CURRENCIES.includes(c.code))

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-dark border border-border rounded-lg text-white hover:border-primary/50 transition-colors"
      >
        {selected ? (
          <>
            <span className="text-lg">{selected.symbol}</span>
            <span className="text-sm font-medium">{selected.code}</span>
          </>
        ) : (
          <>
            <DollarSign size={18} />
            <span className="text-sm">Select</span>
          </>
        )}
        <ChevronDown size={16} className={`text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-64 bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-2 border-b border-border">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search currencies..."
                className="w-full px-3 py-2 bg-dark border border-border rounded-lg text-white text-sm placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/60"
                autoFocus
              />
            </div>

            <div className="max-h-64 overflow-y-auto">
              {popular.length > 0 && (
                <>
                  <div className="px-3 py-1.5 text-xs text-muted uppercase tracking-wide bg-dark/50">
                    Popular
                  </div>
                  {popular.map(currency => (
                    <CurrencyOption
                      key={currency.code}
                      currency={currency}
                      selected={value === currency.code}
                      onClick={() => { onChange(currency.code); setIsOpen(false); setSearch('') }}
                    />
                  ))}
                </>
              )}

              {others.length > 0 && (
                <>
                  <div className="px-3 py-1.5 text-xs text-muted uppercase tracking-wide bg-dark/50">
                    All Currencies
                  </div>
                  {others.map(currency => (
                    <CurrencyOption
                      key={currency.code}
                      currency={currency}
                      selected={value === currency.code}
                      onClick={() => { onChange(currency.code); setIsOpen(false); setSearch('') }}
                    />
                  ))}
                </>
              )}

              {filtered.length === 0 && (
                <div className="p-4 text-center text-muted text-sm">
                  No currencies found
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function CurrencyOption({ currency, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors
        ${selected ? 'bg-primary/10 text-primary' : 'hover:bg-dark text-white'}
      `}
    >
      <span className="w-8 text-lg text-center">{currency.symbol}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{currency.code}</p>
        <p className="text-xs text-muted truncate">{currency.name}</p>
      </div>
      {selected && (
        <div className="w-2 h-2 bg-primary rounded-full" />
      )}
    </button>
  )
}
