import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { createTestUser, testUser } from '../setup.js';
import prisma from '../../src/config/db.js';

describe('Trip Routes', () => {
  const tripData = {
    title: 'Test Trip',
    description: 'A test trip',
    startDate: '2024-06-01',
    endDate: '2024-06-10',
    totalBudget: 1000,
    currency: 'USD'
  };

  describe('POST /api/trips', () => {
    it('should create a new trip', async () => {
      const { accessToken } = await createTestUser();

      const res = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(tripData);

      expect(res.status).toBe(201);
      expect(res.body.title).toBe(tripData.title);
      expect(res.body.status).toBe('draft');
    });

    it('should reject without authentication', async () => {
      const res = await request(app)
        .post('/api/trips')
        .send(tripData);

      expect(res.status).toBe(401);
    });

    it('should reject with missing required fields', async () => {
      const { accessToken } = await createTestUser();

      const res = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Incomplete' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/trips', () => {
    it('should return user trips', async () => {
      const { user, accessToken } = await createTestUser();

      // Create a trip
      await prisma.trip.create({
        data: {
          ...tripData,
          userId: user.id,
          startDate: new Date(tripData.startDate),
          endDate: new Date(tripData.endDate)
        }
      });

      const res = await request(app)
        .get('/api/trips')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.trips).toHaveLength(1);
      expect(res.body.trips[0].title).toBe(tripData.title);
    });

    it('should not return other users trips', async () => {
      const { user: user1 } = await createTestUser();
      const { accessToken: token2 } = await createTestUser({
        ...testUser,
        email: 'other@example.com'
      });

      // Create trip for user1
      await prisma.trip.create({
        data: {
          ...tripData,
          userId: user1.id,
          startDate: new Date(tripData.startDate),
          endDate: new Date(tripData.endDate)
        }
      });

      const res = await request(app)
        .get('/api/trips')
        .set('Authorization', `Bearer ${token2}`);

      expect(res.status).toBe(200);
      expect(res.body.trips).toHaveLength(0);
    });
  });

  describe('GET /api/trips/:id', () => {
    it('should return trip details', async () => {
      const { user, accessToken } = await createTestUser();

      const trip = await prisma.trip.create({
        data: {
          ...tripData,
          userId: user.id,
          startDate: new Date(tripData.startDate),
          endDate: new Date(tripData.endDate)
        }
      });

      const res = await request(app)
        .get(`/api/trips/${trip.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(trip.id);
      expect(res.body.title).toBe(tripData.title);
    });

    it('should return 404 for non-existent trip', async () => {
      const { accessToken } = await createTestUser();

      const res = await request(app)
        .get('/api/trips/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(404);
    });

    it('should reject access to other users trip', async () => {
      const { user: user1 } = await createTestUser();
      const { accessToken: token2 } = await createTestUser({
        ...testUser,
        email: 'other@example.com'
      });

      const trip = await prisma.trip.create({
        data: {
          ...tripData,
          userId: user1.id,
          startDate: new Date(tripData.startDate),
          endDate: new Date(tripData.endDate)
        }
      });

      const res = await request(app)
        .get(`/api/trips/${trip.id}`)
        .set('Authorization', `Bearer ${token2}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/trips/:id', () => {
    it('should update trip', async () => {
      const { user, accessToken } = await createTestUser();

      const trip = await prisma.trip.create({
        data: {
          ...tripData,
          userId: user.id,
          startDate: new Date(tripData.startDate),
          endDate: new Date(tripData.endDate)
        }
      });

      const res = await request(app)
        .put(`/api/trips/${trip.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Updated Title' });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Updated Title');
    });

    it('should reject update from non-owner', async () => {
      const { user: user1 } = await createTestUser();
      const { accessToken: token2 } = await createTestUser({
        ...testUser,
        email: 'other@example.com'
      });

      const trip = await prisma.trip.create({
        data: {
          ...tripData,
          userId: user1.id,
          startDate: new Date(tripData.startDate),
          endDate: new Date(tripData.endDate)
        }
      });

      const res = await request(app)
        .put(`/api/trips/${trip.id}`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ title: 'Hacked' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/trips/:id', () => {
    it('should delete trip', async () => {
      const { user, accessToken } = await createTestUser();

      const trip = await prisma.trip.create({
        data: {
          ...tripData,
          userId: user.id,
          startDate: new Date(tripData.startDate),
          endDate: new Date(tripData.endDate)
        }
      });

      const res = await request(app)
        .delete(`/api/trips/${trip.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);

      // Verify deletion
      const deleted = await prisma.trip.findUnique({ where: { id: trip.id } });
      expect(deleted).toBeNull();
    });

    it('should reject delete from non-owner', async () => {
      const { user: user1 } = await createTestUser();
      const { accessToken: token2 } = await createTestUser({
        ...testUser,
        email: 'other@example.com'
      });

      const trip = await prisma.trip.create({
        data: {
          ...tripData,
          userId: user1.id,
          startDate: new Date(tripData.startDate),
          endDate: new Date(tripData.endDate)
        }
      });

      const res = await request(app)
        .delete(`/api/trips/${trip.id}`)
        .set('Authorization', `Bearer ${token2}`);

      expect(res.status).toBe(404);

      // Verify not deleted
      const notDeleted = await prisma.trip.findUnique({ where: { id: trip.id } });
      expect(notDeleted).not.toBeNull();
    });
  });
});
