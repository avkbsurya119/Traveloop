import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { createTestUser, testUser } from '../setup.js';
import prisma from '../../src/config/db.js';

describe('User Routes', () => {
  describe('GET /api/users/:id', () => {
    it('should return user profile', async () => {
      const { user } = await createTestUser();

      const res = await request(app)
        .get(`/api/users/${user.id}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(user.id);
      expect(res.body.firstName).toBe(user.firstName);
      expect(res.body).not.toHaveProperty('passwordHash');
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app)
        .get('/api/users/00000000-0000-0000-0000-000000000000');

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/users/username/:username', () => {
    it('should return user by username', async () => {
      const { user } = await createTestUser();

      // Set username
      await prisma.user.update({
        where: { id: user.id },
        data: { username: 'testuser' }
      });

      const res = await request(app)
        .get('/api/users/username/testuser');

      expect(res.status).toBe(200);
      expect(res.body.username).toBe('testuser');
    });

    it('should return 403 for private profile', async () => {
      const { user } = await createTestUser();

      await prisma.user.update({
        where: { id: user.id },
        data: { username: 'privateuser', isPublicProfile: false }
      });

      const res = await request(app)
        .get('/api/users/username/privateuser');

      expect(res.status).toBe(403);
    });

    it('should return 404 for non-existent username', async () => {
      const res = await request(app)
        .get('/api/users/username/nonexistent');

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user profile', async () => {
      const { user, accessToken } = await createTestUser();

      const res = await request(app)
        .put(`/api/users/${user.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          firstName: 'Updated',
          bio: 'New bio'
        });

      expect(res.status).toBe(200);
      expect(res.body.firstName).toBe('Updated');
      expect(res.body.bio).toBe('New bio');
    });

    it('should reject update from other user', async () => {
      const { user } = await createTestUser();
      const { accessToken: otherToken } = await createTestUser({
        ...testUser,
        email: 'other@example.com'
      });

      const res = await request(app)
        .put(`/api/users/${user.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ firstName: 'Hacked' });

      expect(res.status).toBe(403);
    });

    it('should reject duplicate username', async () => {
      const { user, accessToken } = await createTestUser();

      // Create another user with username
      const { user: otherUser } = await createTestUser({
        ...testUser,
        email: 'other@example.com'
      });
      await prisma.user.update({
        where: { id: otherUser.id },
        data: { username: 'taken' }
      });

      const res = await request(app)
        .put(`/api/users/${user.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ username: 'taken' });

      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/users/:id/stats', () => {
    it('should return user stats', async () => {
      const { user } = await createTestUser();

      const res = await request(app)
        .get(`/api/users/${user.id}/stats`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('tripCount');
      expect(res.body).toHaveProperty('postCount');
      expect(res.body).toHaveProperty('savedCount');
      expect(res.body).toHaveProperty('badges');
    });
  });

  describe('PATCH /api/users/:id/privacy', () => {
    it('should update profile visibility', async () => {
      const { user, accessToken } = await createTestUser();

      const res = await request(app)
        .patch(`/api/users/${user.id}/privacy`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ isPublicProfile: false });

      expect(res.status).toBe(200);
      expect(res.body.isPublicProfile).toBe(false);
    });

    it('should reject from other user', async () => {
      const { user } = await createTestUser();
      const { accessToken: otherToken } = await createTestUser({
        ...testUser,
        email: 'other@example.com'
      });

      const res = await request(app)
        .patch(`/api/users/${user.id}/privacy`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ isPublicProfile: false });

      expect(res.status).toBe(403);
    });
  });
});
