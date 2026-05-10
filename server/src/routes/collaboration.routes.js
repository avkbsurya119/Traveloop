import { Router } from 'express';
import prisma from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * @swagger
 * /trips/{tripId}/collaborators:
 *   get:
 *     summary: Get all collaborators for a trip
 *     tags: [Collaboration]
 *     security:
 *       - bearerAuth: []
 */
router.get('/trips/:tripId/collaborators', authenticate, async (req, res, next) => {
  try {
    const { tripId } = req.params;

    // Check trip access
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        OR: [
          { userId: req.user.id },
          { collaborators: { some: { userId: req.user.id } } }
        ]
      },
      select: { userId: true }
    });

    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const collaborators = await prisma.tripCollaborator.findMany({
      where: { tripId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } }
      },
      orderBy: { invitedAt: 'desc' }
    });

    // Add owner info
    const owner = await prisma.user.findUnique({
      where: { id: trip.userId },
      select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true }
    });

    res.json({
      owner,
      collaborators: collaborators.map(c => ({
        ...c.user,
        role: c.role,
        invitedAt: c.invitedAt,
        acceptedAt: c.acceptedAt
      }))
    });
  } catch (error) { next(error); }
});

/**
 * @swagger
 * /trips/{tripId}/collaborators:
 *   post:
 *     summary: Invite a collaborator to a trip
 *     tags: [Collaboration]
 *     security:
 *       - bearerAuth: []
 */
router.post('/trips/:tripId/collaborators', authenticate, async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { email, role = 'viewer' } = req.body;

    if (!email) return res.status(400).json({ error: 'Email is required' });

    // Only trip owner or admin collaborators can invite
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        OR: [
          { userId: req.user.id },
          { collaborators: { some: { userId: req.user.id, role: 'admin' } } }
        ]
      }
    });

    if (!trip) return res.status(403).json({ error: 'Not authorized to invite collaborators' });

    // Find user by email
    const invitee = await prisma.user.findUnique({
      where: { email },
      select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true }
    });

    if (!invitee) return res.status(404).json({ error: 'User not found with that email' });

    if (invitee.id === trip.userId) {
      return res.status(400).json({ error: 'Cannot invite the trip owner' });
    }

    // Check if already a collaborator
    const existing = await prisma.tripCollaborator.findUnique({
      where: { tripId_userId: { tripId, userId: invitee.id } }
    });

    if (existing) return res.status(409).json({ error: 'User is already a collaborator' });

    const collaborator = await prisma.tripCollaborator.create({
      data: {
        tripId,
        userId: invitee.id,
        role
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } }
      }
    });

    // Emit socket event if io is available
    const io = req.app.get('io');
    if (io) {
      io.to(`trip:${tripId}`).emit('collaborator:added', {
        ...collaborator.user,
        role: collaborator.role
      });
    }

    res.status(201).json({
      ...collaborator.user,
      role: collaborator.role,
      invitedAt: collaborator.invitedAt
    });
  } catch (error) { next(error); }
});

/**
 * @swagger
 * /trips/{tripId}/collaborators/{userId}:
 *   patch:
 *     summary: Update collaborator role
 *     tags: [Collaboration]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/trips/:tripId/collaborators/:userId', authenticate, async (req, res, next) => {
  try {
    const { tripId, userId } = req.params;
    const { role } = req.body;

    if (!['viewer', 'editor', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Only trip owner or admin can update roles
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        OR: [
          { userId: req.user.id },
          { collaborators: { some: { userId: req.user.id, role: 'admin' } } }
        ]
      }
    });

    if (!trip) return res.status(403).json({ error: 'Not authorized' });

    const collaborator = await prisma.tripCollaborator.update({
      where: { tripId_userId: { tripId, userId } },
      data: { role },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } }
      }
    });

    res.json({
      ...collaborator.user,
      role: collaborator.role
    });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Collaborator not found' });
    next(error);
  }
});

/**
 * @swagger
 * /trips/{tripId}/collaborators/{userId}:
 *   delete:
 *     summary: Remove a collaborator from a trip
 *     tags: [Collaboration]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/trips/:tripId/collaborators/:userId', authenticate, async (req, res, next) => {
  try {
    const { tripId, userId } = req.params;

    // Trip owner, admin, or the collaborator themselves can remove
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: { userId: true }
    });

    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const isOwner = trip.userId === req.user.id;
    const isSelf = userId === req.user.id;

    if (!isOwner && !isSelf) {
      // Check if requester is admin
      const requesterCollab = await prisma.tripCollaborator.findUnique({
        where: { tripId_userId: { tripId, userId: req.user.id } }
      });

      if (!requesterCollab || requesterCollab.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized' });
      }
    }

    await prisma.tripCollaborator.delete({
      where: { tripId_userId: { tripId, userId } }
    });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`trip:${tripId}`).emit('collaborator:removed', { userId });
    }

    res.json({ message: 'Collaborator removed' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Collaborator not found' });
    next(error);
  }
});

/**
 * @swagger
 * /trips/{tripId}/history:
 *   get:
 *     summary: Get edit history for a trip
 *     tags: [Collaboration]
 *     security:
 *       - bearerAuth: []
 */
router.get('/trips/:tripId/history', authenticate, async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Check trip access
    const hasAccess = await prisma.trip.findFirst({
      where: {
        id: tripId,
        OR: [
          { userId: req.user.id },
          { collaborators: { some: { userId: req.user.id } } }
        ]
      }
    });

    if (!hasAccess) return res.status(404).json({ error: 'Trip not found' });

    const history = await prisma.tripEditHistory.findMany({
      where: { tripId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset)
    });

    res.json(history);
  } catch (error) { next(error); }
});

export default router;
