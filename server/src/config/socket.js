import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from './db.js';

export function initializeSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', process.env.FRONTEND_URL].filter(Boolean),
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, firstName: true, lastName: true, avatarUrl: true, isActive: true }
      });

      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  // Track active users per trip
  const tripPresence = new Map(); // tripId -> Map<socketId, user>

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.firstName} ${socket.user.lastName}`);

    // Join trip room
    socket.on('join:trip', async (tripId) => {
      try {
        // Verify user has access to trip
        const hasAccess = await prisma.trip.findFirst({
          where: {
            id: tripId,
            OR: [
              { userId: socket.user.id },
              { collaborators: { some: { userId: socket.user.id } } }
            ]
          }
        });

        if (!hasAccess) {
          socket.emit('error', { message: 'Access denied to this trip' });
          return;
        }

        socket.join(`trip:${tripId}`);

        // Track presence
        if (!tripPresence.has(tripId)) {
          tripPresence.set(tripId, new Map());
        }
        tripPresence.get(tripId).set(socket.id, {
          ...socket.user,
          joinedAt: new Date()
        });

        // Broadcast presence update
        const activeUsers = Array.from(tripPresence.get(tripId).values());
        io.to(`trip:${tripId}`).emit('presence:update', activeUsers);

        socket.tripId = tripId;
      } catch (error) {
        socket.emit('error', { message: 'Failed to join trip' });
      }
    });

    // Leave trip room
    socket.on('leave:trip', (tripId) => {
      socket.leave(`trip:${tripId}`);
      removeFromPresence(socket, tripId);
    });

    // Trip update events
    socket.on('trip:update', async (data) => {
      const { tripId, field, value, action } = data;

      // Log edit history
      try {
        await prisma.tripEditHistory.create({
          data: {
            tripId,
            userId: socket.user.id,
            action: action || 'update',
            field,
            newValue: value
          }
        });
      } catch (e) {
        console.error('Failed to log edit history:', e);
      }

      // Broadcast to other users in the trip
      socket.to(`trip:${tripId}`).emit('trip:updated', {
        tripId,
        field,
        value,
        action,
        updatedBy: socket.user
      });
    });

    // Itinerary item updates
    socket.on('itinerary:update', (data) => {
      socket.to(`trip:${data.tripId}`).emit('itinerary:updated', {
        ...data,
        updatedBy: socket.user
      });
    });

    // Expense updates
    socket.on('expense:update', (data) => {
      socket.to(`trip:${data.tripId}`).emit('expense:updated', {
        ...data,
        updatedBy: socket.user
      });
    });

    // Cursor/selection tracking for real-time editing
    socket.on('cursor:move', (data) => {
      socket.to(`trip:${data.tripId}`).emit('cursor:moved', {
        ...data,
        userId: socket.user.id,
        user: socket.user
      });
    });

    // Typing indicator
    socket.on('typing:start', (data) => {
      socket.to(`trip:${data.tripId}`).emit('user:typing', {
        ...data,
        user: socket.user
      });
    });

    socket.on('typing:stop', (data) => {
      socket.to(`trip:${data.tripId}`).emit('user:stopped_typing', {
        userId: socket.user.id,
        tripId: data.tripId
      });
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.firstName} ${socket.user.lastName}`);
      if (socket.tripId) {
        removeFromPresence(socket, socket.tripId);
      }
    });
  });

  function removeFromPresence(socket, tripId) {
    if (tripPresence.has(tripId)) {
      tripPresence.get(tripId).delete(socket.id);
      const activeUsers = Array.from(tripPresence.get(tripId).values());
      io.to(`trip:${tripId}`).emit('presence:update', activeUsers);

      if (tripPresence.get(tripId).size === 0) {
        tripPresence.delete(tripId);
      }
    }
  }

  return io;
}

export default initializeSocket;
