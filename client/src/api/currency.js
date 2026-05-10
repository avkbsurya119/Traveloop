import client from './client'

export const currencyApi = {
  getSupportedCurrencies: () => client.get('/currency/supported'),

  getRates: (base = 'USD') => client.get(`/currency/rates?base=${base}`),

  convert: (amount, from, to) => client.post('/currency/convert', { amount, from, to }),

  convertBatch: (conversions) => client.post('/currency/convert-batch', { conversions }),
}
