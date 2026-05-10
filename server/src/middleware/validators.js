import { z } from 'zod';

// ─── Common Schemas ──────────────────────────────────────────────────────────

const emailSchema = z.string()
  .email('Invalid email format')
  .max(255, 'Email must be less than 255 characters');

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const uuidSchema = z.string().uuid('Invalid ID format');

const dateSchema = z.string().refine((val) => {
  const date = new Date(val);
  return !isNaN(date.getTime());
}, 'Invalid date format');

// ─── Auth Schemas ────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  phone: z.string().max(20).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  bio: z.string().max(500).optional()
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  captchaAnswer: z.string().optional()
});

export const forgotPasswordSchema = z.object({
  email: emailSchema
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
  code: z.string().length(6, 'Code must be 6 digits'),
  newPassword: passwordSchema
});

// ─── Trip Schemas ────────────────────────────────────────────────────────────

export const createTripSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(2000).optional(),
  startDate: dateSchema,
  endDate: dateSchema,
  totalBudget: z.number().min(0, 'Budget cannot be negative').optional(),
  currency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
  stops: z.array(z.object({
    cityId: uuidSchema,
    arrivalDate: dateSchema,
    departureDate: dateSchema,
    notes: z.string().optional()
  })).optional()
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end >= start;
}, {
  message: 'End date must be after or equal to start date',
  path: ['endDate']
});

export const updateTripSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  totalBudget: z.number().min(0).optional(),
  currency: z.string().length(3).optional(),
  status: z.enum(['draft', 'planned', 'ongoing', 'completed']).optional(),
  isPublic: z.boolean().optional(),
  coverPhotoUrl: z.string().url().optional().nullable()
}).refine((data) => {
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end >= start;
  }
  return true;
}, {
  message: 'End date must be after or equal to start date',
  path: ['endDate']
});

// ─── Trip Stop Schemas ───────────────────────────────────────────────────────

export const createStopSchema = z.object({
  cityId: uuidSchema,
  arrivalDate: dateSchema,
  departureDate: dateSchema,
  notes: z.string().max(1000).optional()
}).refine((data) => {
  const arrival = new Date(data.arrivalDate);
  const departure = new Date(data.departureDate);
  return departure >= arrival;
}, {
  message: 'Departure date must be after or equal to arrival date',
  path: ['departureDate']
});

export const updateStopSchema = z.object({
  arrivalDate: dateSchema.optional(),
  departureDate: dateSchema.optional(),
  notes: z.string().max(1000).optional()
}).refine((data) => {
  if (data.arrivalDate && data.departureDate) {
    const arrival = new Date(data.arrivalDate);
    const departure = new Date(data.departureDate);
    return departure >= arrival;
  }
  return true;
}, {
  message: 'Departure date must be after or equal to arrival date',
  path: ['departureDate']
});

// ─── Itinerary Item Schemas ──────────────────────────────────────────────────

export const createItineraryItemSchema = z.object({
  stopId: uuidSchema,
  activityId: uuidSchema.optional(),
  customTitle: z.string().max(255).optional(),
  date: dateSchema,
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
  cost: z.number().min(0, 'Cost cannot be negative').default(0),
  notes: z.string().max(1000).optional(),
  sectionType: z.enum(['activity', 'transit', 'flight', 'accommodation', 'food', 'other']).optional()
}).refine((data) => {
  if (data.startTime && data.endTime) {
    return data.endTime > data.startTime;
  }
  return true;
}, {
  message: 'End time must be after start time',
  path: ['endTime']
});

export const updateItineraryItemSchema = z.object({
  activityId: uuidSchema.optional().nullable(),
  customTitle: z.string().max(255).optional(),
  date: dateSchema.optional(),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().nullable(),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().nullable(),
  cost: z.number().min(0).optional(),
  notes: z.string().max(1000).optional(),
  sectionType: z.enum(['activity', 'transit', 'flight', 'accommodation', 'food', 'other']).optional()
}).refine((data) => {
  if (data.startTime && data.endTime) {
    return data.endTime > data.startTime;
  }
  return true;
}, {
  message: 'End time must be after start time',
  path: ['endTime']
});

// ─── Expense Schemas ─────────────────────────────────────────────────────────

export const createExpenseSchema = z.object({
  category: z.enum(['hotel', 'flight', 'food', 'activity', 'transport', 'shopping', 'other']),
  description: z.string().max(500).optional(),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3).default('USD'),
  date: dateSchema.optional(),
  stopId: uuidSchema.optional()
});

export const updateExpenseSchema = z.object({
  category: z.enum(['hotel', 'flight', 'food', 'activity', 'transport', 'shopping', 'other']).optional(),
  description: z.string().max(500).optional(),
  amount: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  date: dateSchema.optional().nullable(),
  stopId: uuidSchema.optional().nullable()
});

// ─── User Schemas ────────────────────────────────────────────────────────────

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
    .optional(),
  phone: z.string().max(20).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional().nullable()
});

// ─── Community Schemas ───────────────────────────────────────────────────────

export const createPostSchema = z.object({
  content: z.string().min(1, 'Content is required').max(5000),
  tripId: uuidSchema.optional(),
  imageUrl: z.string().url().optional(),
  tags: z.array(z.string().max(50)).max(10).optional()
});

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment is required').max(1000)
});

// ─── Validation Middleware Factory ───────────────────────────────────────────

export function validate(schema) {
  return async (req, res, next) => {
    try {
      const validated = await schema.parseAsync(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error.errors) {
        const errors = error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }));
        return res.status(400).json({
          error: 'Validation failed',
          details: errors
        });
      }
      return res.status(400).json({ error: 'Invalid request data' });
    }
  };
}

// ─── Itinerary Overlap Check Utility ─────────────────────────────────────────

export async function checkItineraryOverlap(prisma, stopId, date, startTime, endTime, excludeItemId = null) {
  if (!startTime || !endTime) return { hasOverlap: false };

  const where = {
    stopId,
    date: new Date(date),
    startTime: { not: null },
    endTime: { not: null }
  };

  if (excludeItemId) {
    where.id = { not: excludeItemId };
  }

  const existingItems = await prisma.itineraryItem.findMany({
    where,
    select: { id: true, customTitle: true, startTime: true, endTime: true }
  });

  const newStart = startTime;
  const newEnd = endTime;

  for (const item of existingItems) {
    const itemStart = item.startTime.toISOString().substring(11, 16);
    const itemEnd = item.endTime.toISOString().substring(11, 16);

    // Check for overlap: (StartA < EndB) && (EndA > StartB)
    if (newStart < itemEnd && newEnd > itemStart) {
      return {
        hasOverlap: true,
        conflictingItem: {
          id: item.id,
          title: item.customTitle,
          time: `${itemStart} - ${itemEnd}`
        }
      };
    }
  }

  return { hasOverlap: false };
}

// ─── Date Range Validation Utility ───────────────────────────────────────────

export function validateStopWithinTrip(tripStartDate, tripEndDate, stopArrivalDate, stopDepartureDate) {
  const tripStart = new Date(tripStartDate);
  const tripEnd = new Date(tripEndDate);
  const arrival = new Date(stopArrivalDate);
  const departure = new Date(stopDepartureDate);

  if (arrival < tripStart || departure > tripEnd) {
    return {
      valid: false,
      message: 'Stop dates must be within trip date range'
    };
  }

  return { valid: true };
}

export function validateItemWithinStop(stopArrivalDate, stopDepartureDate, itemDate) {
  const arrival = new Date(stopArrivalDate);
  const departure = new Date(stopDepartureDate);
  const date = new Date(itemDate);

  if (date < arrival || date > departure) {
    return {
      valid: false,
      message: 'Itinerary item date must be within stop date range'
    };
  }

  return { valid: true };
}
