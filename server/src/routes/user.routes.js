import { Router } from 'express';
import prisma from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Get user by username (public profile)
router.get('/username/:username', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username },
      select: {
        id: true, firstName: true, lastName: true, username: true, city: true, country: true, bio: true,
        avatarUrl: true, createdAt: true, isPublicProfile: true,
        trips: { where: { isPublic: true }, select: { id: true, title: true, coverPhotoUrl: true, startDate: true, endDate: true, status: true }, take: 6 },
        _count: { select: { trips: true, communityPosts: true } }
      }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.isPublicProfile) return res.status(403).json({ error: 'This profile is private' });
    res.json(user);
  } catch (error) { next(error); }
});

// Get user profile (public or private)
router.get('/:id', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, firstName: true, lastName: true, city: true, country: true, bio: true,
        avatarUrl: true, createdAt: true, isPublicProfile: true,
        trips: { where: { isPublic: true }, select: { id: true, title: true, coverPhotoUrl: true, startDate: true, endDate: true, status: true }, take: 6 },
        _count: { select: { trips: true, communityPosts: true } }
      }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) { next(error); }
});

// Get user stats
router.get('/:id/stats', async (req, res, next) => {
  try {
    const [tripCount, postCount, savedCount, countriesVisited] = await Promise.all([
      prisma.trip.count({ where: { userId: req.params.id } }),
      prisma.communityPost.count({ where: { userId: req.params.id } }),
      prisma.savedDestination.count({ where: { userId: req.params.id } }),
      prisma.tripStop.findMany({
        where: { trip: { userId: req.params.id } },
        select: { city: { select: { country: true } } },
        distinct: ['cityId']
      })
    ]);

    const countries = [...new Set(countriesVisited.map(s => s.city.country))];

    // Badges
    const badges = [];
    if (tripCount >= 1) badges.push({ name: 'First Trip', icon: '🎒', description: 'Created your first trip' });
    if (tripCount >= 5) badges.push({ name: 'Explorer', icon: '🧭', description: '5+ trips planned' });
    if (tripCount >= 10) badges.push({ name: 'Globetrotter', icon: '🌍', description: '10+ trips planned' });
    if (countries.length >= 3) badges.push({ name: 'World Traveler', icon: '✈️', description: 'Visited 3+ countries' });
    if (countries.length >= 5) badges.push({ name: 'Jetsetter', icon: '🛩️', description: 'Visited 5+ countries' });
    if (postCount >= 5) badges.push({ name: 'Storyteller', icon: '📝', description: '5+ community posts' });
    if (postCount >= 10) badges.push({ name: 'Influencer', icon: '⭐', description: '10+ community posts' });
    if (savedCount >= 3) badges.push({ name: 'Dreamer', icon: '💭', description: '3+ saved destinations' });

    res.json({ tripCount, postCount, savedCount, countriesVisited: countries.length, countries, badges });
  } catch (error) { next(error); }
});

// Update user profile
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const { firstName, lastName, phone, city, country, bio, avatarUrl, username } = req.body;

    // Check username uniqueness if provided
    if (username) {
      const existing = await prisma.user.findFirst({
        where: { username, NOT: { id: req.params.id } }
      });
      if (existing) return res.status(409).json({ error: 'Username already taken' });
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { firstName, lastName, phone, city, country, bio, avatarUrl, username: username || undefined },
      select: { id: true, email: true, firstName: true, lastName: true, username: true, phone: true, city: true, country: true, bio: true, avatarUrl: true }
    });
    res.json(user);
  } catch (error) { next(error); }
});

// Upload avatar (base64)
router.post('/:id/avatar', authenticate, async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id) return res.status(403).json({ error: 'Not authorized' });
    const { avatar } = req.body; // base64 data URI
    if (!avatar) return res.status(400).json({ error: 'Avatar data required' });

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { avatarUrl: avatar },
      select: { id: true, avatarUrl: true }
    });
    res.json(user);
  } catch (error) { next(error); }
});

// Update privacy
router.patch('/:id/privacy', authenticate, async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id) return res.status(403).json({ error: 'Not authorized' });
    const { isPublicProfile } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isPublicProfile: !!isPublicProfile },
      select: { id: true, isPublicProfile: true }
    });
    res.json(user);
  } catch (error) { next(error); }
});

// Delete user (soft delete)
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await prisma.user.update({ where: { id: req.params.id }, data: { isActive: false, deletedAt: new Date() } });
    res.json({ message: 'Account deactivated' });
  } catch (error) { next(error); }
});

// Get saved destinations
router.get('/:id/saved-destinations', authenticate, async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id) return res.status(403).json({ error: 'Not authorized' });
    const saved = await prisma.savedDestination.findMany({
      where: { userId: req.params.id },
      include: { city: { select: { id: true, name: true, country: true, imageUrl: true, region: true } } }
    });
    res.json(saved.map(s => s.city));
  } catch (error) { next(error); }
});

// Save destination
router.post('/:id/saved-destinations/:cityId', authenticate, async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id) return res.status(403).json({ error: 'Not authorized' });
    await prisma.savedDestination.create({ data: { userId: req.params.id, cityId: req.params.cityId } });
    res.status(201).json({ message: 'Destination saved' });
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ error: 'Already saved' });
    next(error);
  }
});

// Remove saved destination
router.delete('/:id/saved-destinations/:cityId', authenticate, async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id) return res.status(403).json({ error: 'Not authorized' });
    await prisma.savedDestination.delete({
      where: { userId_cityId: { userId: req.params.id, cityId: req.params.cityId } }
    });
    res.json({ message: 'Destination removed' });
  } catch (error) { next(error); }
});

export default router;
