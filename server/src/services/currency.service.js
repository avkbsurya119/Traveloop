import Redis from 'ioredis';

const CACHE_TTL = 3600; // 1 hour
const EXCHANGE_API_URL = 'https://api.exchangerate-api.com/v4/latest';

// List of supported currencies
export const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '\u20AC' },
  { code: 'GBP', name: 'British Pound', symbol: '\u00A3' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '\u00A5' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '\u00A5' },
  { code: 'INR', name: 'Indian Rupee', symbol: '\u20B9' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'KRW', name: 'South Korean Won', symbol: '\u20A9' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'THB', name: 'Thai Baht', symbol: '\u0E3F' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '\u20B1' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '\u20AB' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '\u20BA' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'z\u0142' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'K\u010D' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' }
];

let redis = null;

function getRedis() {
  if (!redis && process.env.REDIS_URL) {
    try {
      redis = new Redis(process.env.REDIS_URL);
    } catch (e) {
      console.warn('Redis connection failed, using in-memory cache');
    }
  }
  return redis;
}

// In-memory fallback cache
const memoryCache = new Map();

async function getCached(key) {
  const r = getRedis();
  if (r) {
    const data = await r.get(key);
    return data ? JSON.parse(data) : null;
  }
  const cached = memoryCache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  return null;
}

async function setCached(key, data, ttl = CACHE_TTL) {
  const r = getRedis();
  if (r) {
    await r.setex(key, ttl, JSON.stringify(data));
  } else {
    memoryCache.set(key, { data, expires: Date.now() + ttl * 1000 });
  }
}

export async function getExchangeRates(baseCurrency = 'USD') {
  const cacheKey = `exchange_rates:${baseCurrency}`;

  // Check cache
  const cached = await getCached(cacheKey);
  if (cached) return cached;

  // Fetch from API
  const response = await fetch(`${EXCHANGE_API_URL}/${baseCurrency}`);
  if (!response.ok) {
    throw new Error('Failed to fetch exchange rates');
  }

  const data = await response.json();
  const rates = {
    base: data.base,
    date: data.date,
    rates: data.rates
  };

  // Cache the result
  await setCached(cacheKey, rates);

  return rates;
}

export async function convertCurrency(amount, from, to) {
  if (from === to) return { amount, from, to, result: amount, rate: 1 };

  const rates = await getExchangeRates(from);
  const rate = rates.rates[to];

  if (!rate) {
    throw new Error(`Exchange rate not available for ${to}`);
  }

  return {
    amount,
    from,
    to,
    result: Math.round(amount * rate * 100) / 100,
    rate
  };
}

export function getCurrencySymbol(code) {
  const currency = SUPPORTED_CURRENCIES.find(c => c.code === code);
  return currency ? currency.symbol : code;
}

export function formatCurrency(amount, currencyCode) {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
