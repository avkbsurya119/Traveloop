import { beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import prisma from '../src/config/db.js';

// Increase timeout for database operations
jest.setTimeout(30000);

// Test user data
export const testUser = {
  email: 'test@example.com',
  password: 'testpassword123',
  firstName: 'Test',
  lastName: 'User'
};

export const testAdmin = {
  email: 'admin@example.com',
  password: 'adminpassword123',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin'
};

// Helper to create test user and get tokens
export async function createTestUser(userData = testUser) {
  const bcrypt = await import('bcrypt');
  const { generateTokens } = await import('../src/utils/jwt.js');

  const passwordHash = await bcrypt.default.hash(userData.password, 10);

  const user = await prisma.user.create({
    data: {
      email: userData.email,
      passwordHash,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role || 'user'
    }
  });

  const tokens = generateTokens(user.id);

  return { user, ...tokens };
}

// Clean up database between tests
beforeEach(async () => {
  // Clean up in correct order due to foreign key constraints
  await prisma.postComment.deleteMany();
  await prisma.postLike.deleteMany();
  await prisma.communityPost.deleteMany();
  await prisma.tripEditHistory.deleteMany();
  await prisma.tripCollaborator.deleteMany();
  await prisma.tripDocument.deleteMany();
  await prisma.itineraryItem.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.packingItem.deleteMany();
  await prisma.tripNote.deleteMany();
  await prisma.tripStop.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.savedDestination.deleteMany();
  await prisma.user.deleteMany();
});

// Disconnect from database after all tests
afterAll(async () => {
  await prisma.$disconnect();
});
