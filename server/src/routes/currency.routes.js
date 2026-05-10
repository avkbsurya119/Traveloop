import { Router } from 'express';
import { getExchangeRates, convertCurrency, SUPPORTED_CURRENCIES } from '../services/currency.service.js';

const router = Router();

/**
 * @swagger
 * /currency/supported:
 *   get:
 *     summary: Get list of supported currencies
 *     tags: [Currency]
 *     responses:
 *       200:
 *         description: List of supported currencies
 */
router.get('/supported', (req, res) => {
  res.json(SUPPORTED_CURRENCIES);
});

/**
 * @swagger
 * /currency/rates:
 *   get:
 *     summary: Get exchange rates for a base currency
 *     tags: [Currency]
 *     parameters:
 *       - in: query
 *         name: base
 *         schema:
 *           type: string
 *           default: USD
 *         description: Base currency code
 *     responses:
 *       200:
 *         description: Exchange rates
 */
router.get('/rates', async (req, res, next) => {
  try {
    const { base = 'USD' } = req.query;
    const rates = await getExchangeRates(base.toUpperCase());
    res.json(rates);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /currency/convert:
 *   post:
 *     summary: Convert amount between currencies
 *     tags: [Currency]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - from
 *               - to
 *             properties:
 *               amount:
 *                 type: number
 *               from:
 *                 type: string
 *               to:
 *                 type: string
 *     responses:
 *       200:
 *         description: Conversion result
 */
router.post('/convert', async (req, res, next) => {
  try {
    const { amount, from, to } = req.body;

    if (!amount || !from || !to) {
      return res.status(400).json({ error: 'amount, from, and to are required' });
    }

    const result = await convertCurrency(Number(amount), from.toUpperCase(), to.toUpperCase());
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /currency/convert-batch:
 *   post:
 *     summary: Convert multiple amounts between currencies
 *     tags: [Currency]
 */
router.post('/convert-batch', async (req, res, next) => {
  try {
    const { conversions } = req.body;

    if (!Array.isArray(conversions)) {
      return res.status(400).json({ error: 'conversions must be an array' });
    }

    const results = await Promise.all(
      conversions.map(({ amount, from, to }) =>
        convertCurrency(Number(amount), from.toUpperCase(), to.toUpperCase())
      )
    );

    res.json(results);
  } catch (error) {
    next(error);
  }
});

export default router;
