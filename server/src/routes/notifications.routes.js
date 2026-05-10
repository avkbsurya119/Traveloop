import { Router } from 'express';
import prisma from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// GET /api/notifications — derive real notifications from existing data
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in1Day = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);

    const [
      upcomingTrips,
      todayTrips,
      overBudgetTrips,
      recentComments,
      recentLikes,
    ] = await Promise.all([
      // Trips starting in next 7 days
      prisma.trip.findMany({
        where: {
          userId,
          startDate: { gte: now, lte: in7Days },
          status: { in: ['planned', 'draft'] }
        },
        select: { id: true, title: true, startDate: true },
        take: 3,
        orderBy: { startDate: 'asc' }
      }),
      // Trips starting today
      prisma.trip.findMany({
        where: {
          userId,
          startDate: { gte: now, lte: in1Day },
        },
        select: { id: true, title: true },
        take: 2
      }),
      // Trips where total expense > budget
      prisma.trip.findMany({
        where: { userId, totalBudget: { gt: 0 } },
        select: {
          id: true, title: true, totalBudget: true,
          expenses: { select: { amount: true } }
        },
        take: 10,
        orderBy: { createdAt: 'desc' }
      }),
      // Recent comments on user's community posts (last 7 days)
      prisma.postComment.findMany({
        where: {
          post: { userId },
          userId: { not: userId },
          createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
        },
        select: {
          id: true, content: true, createdAt: true,
          user: { select: { firstName: true, lastName: true } },
          post: { select: { id: true, content: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      // Recent likes on user's posts (last 3 days)
      prisma.postLike.findMany({
        where: {
          post: { userId },
          userId: { not: userId },
          createdAt: { gte: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) }
        },
        select: {
          createdAt: true,
          user: { select: { firstName: true } },
          post: { select: { id: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    const notifications = [];

    // Today's trips
    todayTrips.forEach(t => {
      notifications.push({
        id: `trip-today-${t.id}`,
        icon: '🚀',
        type: 'trip_start',
        title: `Your trip starts today!`,
        desc: `"${t.title}" begins now. Have a great journey!`,
        tripId: t.id,
        createdAt: now.toISOString(),
        unread: true
      });
    });

    // Upcoming trips (excluding today's)
    const todayIds = new Set(todayTrips.map(t => t.id));
    upcomingTrips.filter(t => !todayIds.has(t.id)).forEach(t => {
      const daysUntil = Math.ceil((new Date(t.startDate) - now) / (1000 * 60 * 60 * 24));
      notifications.push({
        id: `trip-upcoming-${t.id}`,
        icon: '✈️',
        type: 'trip_reminder',
        title: `Trip reminder`,
        desc: `"${t.title}" starts in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}. Make sure you're packed!`,
        tripId: t.id,
        createdAt: new Date(now.getTime() - 60000).toISOString(),
        unread: true
      });
    });

    // Over-budget trips
    overBudgetTrips.forEach(t => {
      const spent = t.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
      if (spent > Number(t.totalBudget)) {
        notifications.push({
          id: `budget-${t.id}`,
          icon: '⚠️',
          type: 'budget_alert',
          title: `Over budget alert`,
          desc: `"${t.title}" has exceeded its budget by $${(spent - Number(t.totalBudget)).toLocaleString()}.`,
          tripId: t.id,
          createdAt: new Date(now.getTime() - 2 * 60000).toISOString(),
          unread: false
        });
      }
    });

    // Recent comments on posts
    recentComments.forEach(c => {
      notifications.push({
        id: `comment-${c.id}`,
        icon: '💬',
        type: 'comment',
        title: `${c.user.firstName} commented on your post`,
        desc: c.content.slice(0, 80) + (c.content.length > 80 ? '...' : ''),
        postId: c.post.id,
        createdAt: c.createdAt.toISOString(),
        unread: true
      });
    });

    // Recent likes
    if (recentLikes.length > 0) {
      const names = recentLikes.slice(0, 2).map(l => l.user.firstName);
      const others = recentLikes.length - names.length;
      notifications.push({
        id: `likes-${recentLikes[0].post.id}`,
        icon: '❤️',
        type: 'like',
        title: `Your post was liked`,
        desc: `${names.join(', ')}${others > 0 ? ` and ${others} other${others !== 1 ? 's' : ''}` : ''} liked your community post.`,
        postId: recentLikes[0].post.id,
        createdAt: recentLikes[0].createdAt.toISOString(),
        unread: true
      });
    }

    // Sort by most recent, limit 20
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      notifications: notifications.slice(0, 20),
      unreadCount: notifications.filter(n => n.unread).length
    });
  } catch (error) {
    next(error);
  }
});

export default router;
