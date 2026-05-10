import { Router } from 'express';
import crypto from 'crypto';
import prisma from '../config/db.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import {
  validate,
  createTripSchema,
  updateTripSchema,
  createStopSchema,
  updateStopSchema,
  createItineraryItemSchema,
  updateItineraryItemSchema,
  createExpenseSchema,
  updateExpenseSchema,
  checkItineraryOverlap,
  validateStopWithinTrip,
  validateItemWithinStop
} from '../middleware/validators.js';

const router = Router();

/**
 * @swagger
 * /trips:
 *   get:
 *     summary: Get all trips for authenticated user
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, planned, ongoing, completed]
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [date_asc, date_desc]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: List of trips
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status, sort = 'date_desc', limit = 20, offset = 0 } = req.query;

    const where = { userId: req.user.id };
    if (status) where.status = status;

    const orderBy = sort === 'date_asc'
      ? { startDate: 'asc' }
      : { startDate: 'desc' };

    const trips = await prisma.trip.findMany({
      where,
      orderBy,
      take: parseInt(limit),
      skip: parseInt(offset),
      include: {
        stops: {
          include: { city: { select: { id: true, name: true, country: true } } },
          orderBy: { orderIndex: 'asc' }
        },
        _count: { select: { expenses: true, packingItems: true } }
      }
    });

    res.json(trips);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /trips:
 *   post:
 *     summary: Create a new trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - startDate
 *               - endDate
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               totalBudget:
 *                 type: number
 *               currency:
 *                 type: string
 *     responses:
 *       201:
 *         description: Trip created
 */
router.post('/', authenticate, validate(createTripSchema), async (req, res, next) => {
  try {
    const { title, description, startDate, endDate, totalBudget, currency, stops } = req.body;

    // Validate stops are within trip dates if provided
    if (stops?.length > 0) {
      for (const stop of stops) {
        const validation = validateStopWithinTrip(startDate, endDate, stop.arrivalDate, stop.departureDate);
        if (!validation.valid) {
          return res.status(400).json({ error: validation.message, details: [{ field: 'stops', message: validation.message }] });
        }
      }
    }

    const trip = await prisma.trip.create({
      data: {
        userId: req.user.id,
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalBudget: totalBudget || 0,
        currency: currency || 'USD',
        stops: stops ? {
          create: stops.map((stop, index) => ({
            cityId: stop.cityId,
            arrivalDate: new Date(stop.arrivalDate),
            departureDate: new Date(stop.departureDate),
            orderIndex: index,
            notes: stop.notes
          }))
        } : undefined
      },
      include: {
        stops: {
          include: { city: true },
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    res.status(201).json(trip);
  } catch (error) {
    next(error);
  }
});

// Get single trip
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        stops: {
          include: {
            city: true,
            itineraryItems: {
              include: { activity: true },
              orderBy: [{ date: 'asc' }, { orderIndex: 'asc' }]
            }
          },
          orderBy: { orderIndex: 'asc' }
        },
        expenses: true,
        packingItems: true,
        notes: { orderBy: { createdAt: 'desc' } }
      }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (!trip.isPublic && trip.userId !== req.user?.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(trip);
  } catch (error) {
    next(error);
  }
});

// Update trip
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const trip = await prisma.trip.findUnique({ where: { id: req.params.id } });

    if (!trip || trip.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { title, description, startDate, endDate, totalBudget, currency, status, isPublic, coverPhotoUrl } = req.body;

    const updated = await prisma.trip.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        totalBudget,
        currency,
        status,
        isPublic,
        coverPhotoUrl
      },
      include: {
        stops: { include: { city: true }, orderBy: { orderIndex: 'asc' } }
      }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Delete trip
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const trip = await prisma.trip.findUnique({ where: { id: req.params.id } });

    if (!trip || trip.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.trip.delete({ where: { id: req.params.id } });

    res.json({ message: 'Trip deleted' });
  } catch (error) {
    next(error);
  }
});

// Clone trip
router.post('/:id/clone', authenticate, async (req, res, next) => {
  try {
    const original = await prisma.trip.findUnique({
      where: { id: req.params.id },
      include: {
        stops: { include: { itineraryItems: true } },
        packingItems: true
      }
    });

    if (!original) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (!original.isPublic && original.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const clone = await prisma.trip.create({
      data: {
        userId: req.user.id,
        title: `${original.title} (Copy)`,
        description: original.description,
        startDate: original.startDate,
        endDate: original.endDate,
        totalBudget: original.totalBudget,
        currency: original.currency,
        stops: {
          create: original.stops.map(stop => ({
            cityId: stop.cityId,
            arrivalDate: stop.arrivalDate,
            departureDate: stop.departureDate,
            orderIndex: stop.orderIndex,
            notes: stop.notes,
            itineraryItems: {
              create: stop.itineraryItems.map(item => ({
                activityId: item.activityId,
                customTitle: item.customTitle,
                date: item.date,
                startTime: item.startTime,
                endTime: item.endTime,
                cost: item.cost,
                notes: item.notes,
                orderIndex: item.orderIndex
              }))
            }
          }))
        },
        packingItems: {
          create: original.packingItems.map(item => ({
            label: item.label,
            category: item.category
          }))
        }
      }
    });

    res.status(201).json(clone);
  } catch (error) {
    next(error);
  }
});

// Trip stops
router.get('/:id/stops', authenticate, async (req, res, next) => {
  try {
    const stops = await prisma.tripStop.findMany({
      where: { tripId: req.params.id },
      include: { city: true },
      orderBy: { orderIndex: 'asc' }
    });
    res.json(stops);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/stops', authenticate, validate(createStopSchema), async (req, res, next) => {
  try {
    const { cityId, arrivalDate, departureDate, notes } = req.body;

    // Validate stop is within trip dates
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
      select: { startDate: true, endDate: true, userId: true }
    });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    if (trip.userId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const validation = validateStopWithinTrip(trip.startDate, trip.endDate, arrivalDate, departureDate);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.message });
    }

    const count = await prisma.tripStop.count({ where: { tripId: req.params.id } });

    const stop = await prisma.tripStop.create({
      data: {
        tripId: req.params.id,
        cityId,
        arrivalDate: new Date(arrivalDate),
        departureDate: new Date(departureDate),
        orderIndex: count,
        notes
      },
      include: { city: true }
    });

    res.status(201).json(stop);
  } catch (error) {
    next(error);
  }
});

router.put('/:id/stops/:stopId', authenticate, async (req, res, next) => {
  try {
    const { arrivalDate, departureDate, notes } = req.body;

    const stop = await prisma.tripStop.update({
      where: { id: req.params.stopId },
      data: {
        arrivalDate: arrivalDate ? new Date(arrivalDate) : undefined,
        departureDate: departureDate ? new Date(departureDate) : undefined,
        notes
      },
      include: { city: true }
    });

    res.json(stop);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id/stops/:stopId', authenticate, async (req, res, next) => {
  try {
    await prisma.tripStop.delete({ where: { id: req.params.stopId } });
    res.json({ message: 'Stop deleted' });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/stops/reorder', authenticate, async (req, res, next) => {
  try {
    const { stops } = req.body;

    await prisma.$transaction(
      stops.map(({ id, orderIndex }) =>
        prisma.tripStop.update({ where: { id }, data: { orderIndex } })
      )
    );

    res.json({ message: 'Reordered' });
  } catch (error) {
    next(error);
  }
});

// Itinerary items
router.get('/:id/itinerary', optionalAuth, async (req, res, next) => {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
      select: { isPublic: true, userId: true }
    });

    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    if (!trip.isPublic && trip.userId !== req.user?.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const items = await prisma.itineraryItem.findMany({
      where: { stop: { tripId: req.params.id } },
      include: {
        activity: true,
        stop: { include: { city: { select: { name: true } } } }
      },
      orderBy: [{ date: 'asc' }, { orderIndex: 'asc' }]
    });

    res.json(items);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/itinerary-items', authenticate, validate(createItineraryItemSchema), async (req, res, next) => {
  try {
    const { stopId, activityId, customTitle, date, startTime, endTime, cost, notes, sectionType } = req.body;

    // Validate item date is within stop dates
    const stop = await prisma.tripStop.findUnique({
      where: { id: stopId },
      select: { arrivalDate: true, departureDate: true }
    });
    if (!stop) return res.status(404).json({ error: 'Stop not found' });

    const dateValidation = validateItemWithinStop(stop.arrivalDate, stop.departureDate, date);
    if (!dateValidation.valid) {
      return res.status(400).json({ error: dateValidation.message });
    }

    // Check for time overlap if times provided
    if (startTime && endTime) {
      const overlap = await checkItineraryOverlap(prisma, stopId, date, startTime, endTime);
      if (overlap.hasOverlap) {
        return res.status(409).json({
          error: 'Time conflict with existing item',
          conflictingItem: overlap.conflictingItem
        });
      }
    }

    const count = await prisma.itineraryItem.count({ where: { stopId } });

    const item = await prisma.itineraryItem.create({
      data: {
        stopId,
        activityId,
        customTitle,
        date: new Date(date),
        startTime: startTime ? new Date(`1970-01-01T${startTime}`) : null,
        endTime: endTime ? new Date(`1970-01-01T${endTime}`) : null,
        cost: cost || 0,
        notes,
        orderIndex: count
      },
      include: { activity: true }
    });

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

router.put('/:id/itinerary-items/:itemId', authenticate, validate(updateItineraryItemSchema), async (req, res, next) => {
  try {
    const { customTitle, date, startTime, endTime, cost, notes, sectionType } = req.body;

    // Get current item for overlap checking
    const currentItem = await prisma.itineraryItem.findUnique({
      where: { id: req.params.itemId },
      include: { stop: { select: { arrivalDate: true, departureDate: true } } }
    });
    if (!currentItem) return res.status(404).json({ error: 'Item not found' });

    // Check time overlap if times are being updated
    const checkDate = date || currentItem.date;
    const checkStartTime = startTime || (currentItem.startTime ? currentItem.startTime.toISOString().substring(11, 16) : null);
    const checkEndTime = endTime || (currentItem.endTime ? currentItem.endTime.toISOString().substring(11, 16) : null);

    if (checkStartTime && checkEndTime) {
      const overlap = await checkItineraryOverlap(prisma, currentItem.stopId, checkDate, checkStartTime, checkEndTime, req.params.itemId);
      if (overlap.hasOverlap) {
        return res.status(409).json({
          error: 'Time conflict with existing item',
          conflictingItem: overlap.conflictingItem
        });
      }
    }

    const item = await prisma.itineraryItem.update({
      where: { id: req.params.itemId },
      data: {
        customTitle,
        date: date ? new Date(date) : undefined,
        startTime: startTime ? new Date(`1970-01-01T${startTime}`) : undefined,
        endTime: endTime ? new Date(`1970-01-01T${endTime}`) : undefined,
        cost,
        notes
      },
      include: { activity: true }
    });

    res.json(item);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id/itinerary-items/:itemId', authenticate, async (req, res, next) => {
  try {
    await prisma.itineraryItem.delete({ where: { id: req.params.itemId } });
    res.json({ message: 'Item deleted' });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/itinerary-items/reorder', authenticate, async (req, res, next) => {
  try {
    const { items } = req.body;

    await prisma.$transaction(
      items.map(({ id, orderIndex }) =>
        prisma.itineraryItem.update({ where: { id }, data: { orderIndex } })
      )
    );

    res.json({ message: 'Reordered' });
  } catch (error) {
    next(error);
  }
});

// Expenses
router.get('/:id/expenses', authenticate, async (req, res, next) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { tripId: req.params.id },
      include: { stop: { include: { city: { select: { name: true } } } } },
      orderBy: { date: 'desc' }
    });

    const summary = await prisma.expense.aggregate({
      where: { tripId: req.params.id },
      _sum: { amount: true }
    });

    res.json({ expenses, total: summary._sum.amount || 0 });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/expenses', authenticate, validate(createExpenseSchema), async (req, res, next) => {
  try {
    const { stopId, category, description, amount, currency, date, receiptUrl } = req.body;

    const expense = await prisma.expense.create({
      data: {
        tripId: req.params.id,
        stopId,
        category,
        description,
        amount,
        currency: currency || 'USD',
        date: date ? new Date(date) : null,
        receiptUrl
      }
    });

    res.status(201).json(expense);
  } catch (error) {
    next(error);
  }
});

router.put('/:id/expenses/:expId', authenticate, async (req, res, next) => {
  try {
    const { category, description, amount, currency, date, receiptUrl } = req.body;

    const expense = await prisma.expense.update({
      where: { id: req.params.expId },
      data: { category, description, amount, currency, date: date ? new Date(date) : undefined, receiptUrl }
    });

    res.json(expense);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id/expenses/:expId', authenticate, async (req, res, next) => {
  try {
    await prisma.expense.delete({ where: { id: req.params.expId } });
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    next(error);
  }
});

// Checklist
router.get('/:id/checklist', authenticate, async (req, res, next) => {
  try {
    const items = await prisma.packingItem.findMany({
      where: { tripId: req.params.id },
      orderBy: [{ category: 'asc' }, { createdAt: 'asc' }]
    });
    res.json(items);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/checklist', authenticate, async (req, res, next) => {
  try {
    const { label, category } = req.body;

    const item = await prisma.packingItem.create({
      data: {
        tripId: req.params.id,
        label,
        category: category || 'misc'
      }
    });

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/checklist/:itemId', authenticate, async (req, res, next) => {
  try {
    const { isPacked } = req.body;

    const item = await prisma.packingItem.update({
      where: { id: req.params.itemId },
      data: { isPacked }
    });

    res.json(item);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id/checklist/:itemId', authenticate, async (req, res, next) => {
  try {
    await prisma.packingItem.delete({ where: { id: req.params.itemId } });
    res.json({ message: 'Item deleted' });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/checklist/reset', authenticate, async (req, res, next) => {
  try {
    await prisma.packingItem.updateMany({
      where: { tripId: req.params.id },
      data: { isPacked: false }
    });
    res.json({ message: 'Checklist reset' });
  } catch (error) {
    next(error);
  }
});

// Notes
router.get('/:id/notes', authenticate, async (req, res, next) => {
  try {
    const { stopId } = req.query;

    const where = { tripId: req.params.id };
    if (stopId) where.stopId = stopId;

    const notes = await prisma.tripNote.findMany({
      where,
      include: { stop: { include: { city: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' }
    });

    res.json(notes);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/notes', authenticate, async (req, res, next) => {
  try {
    const { stopId, title, content, noteDate } = req.body;

    const note = await prisma.tripNote.create({
      data: {
        tripId: req.params.id,
        stopId,
        title,
        content,
        noteDate: noteDate ? new Date(noteDate) : null
      }
    });

    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
});

router.put('/:id/notes/:noteId', authenticate, async (req, res, next) => {
  try {
    const { title, content, noteDate } = req.body;

    const note = await prisma.tripNote.update({
      where: { id: req.params.noteId },
      data: { title, content, noteDate: noteDate ? new Date(noteDate) : undefined }
    });

    res.json(note);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id/notes/:noteId', authenticate, async (req, res, next) => {
  try {
    await prisma.tripNote.delete({ where: { id: req.params.noteId } });
    res.json({ message: 'Note deleted' });
  } catch (error) {
    next(error);
  }
});

// Budget summary
router.get('/:id/budget', authenticate, async (req, res, next) => {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
      select: { totalBudget: true, currency: true }
    });

    const expenses = await prisma.expense.groupBy({
      by: ['category'],
      where: { tripId: req.params.id },
      _sum: { amount: true }
    });

    const total = expenses.reduce((sum, e) => sum + (Number(e._sum.amount) || 0), 0);

    res.json({
      totalBudget: trip.totalBudget,
      spent: total,
      remaining: Number(trip.totalBudget) - total,
      byCategory: expenses
    });
  } catch (error) {
    next(error);
  }
});

// Daily budget breakdown
router.get('/:id/budget/daily', authenticate, async (req, res, next) => {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
      select: { totalBudget: true, startDate: true, endDate: true, currency: true }
    });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const expenses = await prisma.expense.findMany({
      where: { tripId: req.params.id },
      orderBy: { date: 'asc' }
    });

    // Group by date
    const byDate = {};
    expenses.forEach(e => {
      const key = e.date ? e.date.toISOString().split('T')[0] : 'unassigned';
      if (!byDate[key]) byDate[key] = { date: key, items: [], total: 0 };
      byDate[key].items.push(e);
      byDate[key].total += Number(e.amount);
    });

    res.json({ dailyBreakdown: Object.values(byDate), totalBudget: trip.totalBudget, currency: trip.currency });
  } catch (error) { next(error); }
});

// Expense summary (for invoice)
router.get('/:id/expense-summary', authenticate, async (req, res, next) => {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
      select: { title: true, totalBudget: true, currency: true, startDate: true, endDate: true,
        user: { select: { firstName: true, lastName: true, email: true } } }
    });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const [expenses, byCategory] = await Promise.all([
      prisma.expense.findMany({ where: { tripId: req.params.id }, orderBy: { date: 'asc' },
        include: { stop: { include: { city: { select: { name: true } } } } }
      }),
      prisma.expense.groupBy({ by: ['category'], where: { tripId: req.params.id }, _sum: { amount: true } })
    ]);

    const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

    res.json({
      trip: { title: trip.title, startDate: trip.startDate, endDate: trip.endDate, budget: trip.totalBudget, currency: trip.currency },
      user: trip.user,
      expenses,
      byCategory: byCategory.map(c => ({ category: c.category, total: Number(c._sum.amount) })),
      total,
      remaining: Number(trip.totalBudget) - total
    });
  } catch (error) { next(error); }
});

// Share trip (generate token)
router.post('/:id/share', authenticate, async (req, res, next) => {
  try {
    const trip = await prisma.trip.findUnique({ where: { id: req.params.id } });
    if (!trip || trip.userId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const shareToken = trip.shareToken || crypto.randomBytes(16).toString('hex');
    await prisma.trip.update({ where: { id: req.params.id }, data: { shareToken, isPublic: true } });

    res.json({ shareToken, shareUrl: `/trips/shared/${shareToken}` });
  } catch (error) { next(error); }
});

// Get shared trip
router.get('/shared/:token', async (req, res, next) => {
  try {
    const trip = await prisma.trip.findUnique({
      where: { shareToken: req.params.token },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        stops: { include: { city: true, itineraryItems: { include: { activity: true }, orderBy: [{ date: 'asc' }, { orderIndex: 'asc' }] } }, orderBy: { orderIndex: 'asc' } },
        expenses: true, packingItems: true, notes: { orderBy: { createdAt: 'desc' } }
      }
    });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    res.json(trip);
  } catch (error) { next(error); }
});

// Export trip data (JSON)
router.get('/:id/export', authenticate, async (req, res, next) => {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
      include: {
        stops: { include: { city: true, itineraryItems: { include: { activity: true } } } },
        expenses: true, packingItems: true, notes: true
      }
    });
    if (!trip || (trip.userId !== req.user.id && req.user.role !== 'admin')) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    res.setHeader('Content-Disposition', `attachment; filename="${trip.title.replace(/[^a-zA-Z0-9]/g, '_')}_export.json"`);
    res.json(trip);
  } catch (error) { next(error); }
});

export default router;
