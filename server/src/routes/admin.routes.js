import { Router } from 'express';
import prisma from '../config/db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin);

// Get platform stats
router.get('/stats', async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalTrips,
      totalPosts,
      totalCities,
      tripsByStatus,
      recentUsers,
      popularCities,
      budgetAgg
    ] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.trip.count(),
      prisma.communityPost.count(),
      prisma.city.count(),
      prisma.trip.groupBy({ by: ['status'], _count: true }),
      prisma.user.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, firstName: true, lastName: true, email: true, createdAt: true }
      }),
      prisma.tripStop.groupBy({
        by: ['cityId'],
        _count: true,
        orderBy: { _count: { cityId: 'desc' } },
        take: 10
      }),
      prisma.trip.aggregate({ _sum: { totalBudget: true }, _avg: { totalBudget: true } })
    ]);

    const cityIds = popularCities.map(c => c.cityId);
    const cities = await prisma.city.findMany({
      where: { id: { in: cityIds } },
      select: { id: true, name: true, country: true }
    });

    const popularCitiesWithNames = popularCities.map(pc => ({
      ...cities.find(c => c.id === pc.cityId),
      tripCount: pc._count
    }));

    res.json({
      totalUsers,
      totalTrips,
      totalPosts,
      totalCities,
      activeUsers: totalUsers,
      totalBudget: Number(budgetAgg._sum.totalBudget || 0),
      avgBudget: Number(budgetAgg._avg.totalBudget || 0),
      tripsByStatus: tripsByStatus.reduce((acc, t) => {
        acc[t.status] = t._count;
        return acc;
      }, {}),
      recentUsers,
      popularCities: popularCitiesWithNames
    });
  } catch (error) {
    next(error);
  }
});

// Get all users
router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: { select: { trips: true, communityPosts: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit)
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update user role
router.put('/users/:id/role', async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, email: true, role: true }
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Delete user (hard delete for admin)
router.delete('/users/:id', async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'User deleted' });
  } catch (error) {
    next(error);
  }
});

// Get all trips
router.get('/trips', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;

    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          stops: { include: { city: { select: { name: true } } }, take: 3 }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit)
      }),
      prisma.trip.count({ where })
    ]);

    res.json({
      trips,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get popular cities stats
router.get('/cities/popular', async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const popularCities = await prisma.tripStop.groupBy({
      by: ['cityId'],
      _count: true,
      orderBy: { _count: { cityId: 'desc' } },
      take: parseInt(limit)
    });

    const cityIds = popularCities.map(c => c.cityId);
    const cities = await prisma.city.findMany({
      where: { id: { in: cityIds } }
    });

    const result = popularCities.map(pc => ({
      ...cities.find(c => c.id === pc.cityId),
      tripCount: pc._count
    }));

    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
