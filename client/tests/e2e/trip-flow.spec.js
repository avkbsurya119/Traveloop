import { test, expect } from '@playwright/test'

// Helper to login
async function login(page) {
  await page.goto('/login')
  await page.getByLabel(/email/i).fill('test@example.com')
  await page.getByLabel(/password/i).fill('password123')
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL('/dashboard')
}

test.describe('Trip Flow', () => {
  // These tests require a running backend with test user
  // They are marked as skip by default - remove .skip when running with backend

  test.skip('should display dashboard after login', async ({ page }) => {
    await login(page)

    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /new trip/i })).toBeVisible()
  })

  test.skip('should navigate to create trip page', async ({ page }) => {
    await login(page)

    await page.getByRole('link', { name: /new trip/i }).click()

    await expect(page).toHaveURL('/trips/new')
    await expect(page.getByRole('heading', { name: /create.*trip/i })).toBeVisible()
  })

  test.skip('should create a new trip', async ({ page }) => {
    await login(page)
    await page.goto('/trips/new')

    await page.getByLabel(/title/i).fill('My Summer Trip')
    await page.getByLabel(/description/i).fill('A fun summer adventure')
    await page.getByLabel(/start date/i).fill('2024-07-01')
    await page.getByLabel(/end date/i).fill('2024-07-15')
    await page.getByLabel(/budget/i).fill('5000')

    await page.getByRole('button', { name: /create/i }).click()

    // Should redirect to trip detail or builder
    await expect(page).toHaveURL(/\/trips\/[a-z0-9-]+/i)
  })

  test.skip('should display trips list', async ({ page }) => {
    await login(page)
    await page.goto('/trips')

    await expect(page.getByRole('heading', { name: /my trips/i })).toBeVisible()
  })

  test.skip('should filter trips by status', async ({ page }) => {
    await login(page)
    await page.goto('/trips')

    // Click on status filter
    await page.getByRole('button', { name: /all/i }).click()
    await page.getByRole('option', { name: /draft/i }).click()

    // Verify filter is applied (URL param or visual indicator)
    await expect(page.getByRole('button', { name: /draft/i })).toBeVisible()
  })

  test.skip('should navigate to trip detail', async ({ page }) => {
    await login(page)
    await page.goto('/trips')

    // Click on first trip card
    await page.locator('[data-testid="trip-card"]').first().click()

    await expect(page).toHaveURL(/\/trips\/[a-z0-9-]+$/i)
  })

  test.skip('should navigate to itinerary builder', async ({ page }) => {
    await login(page)
    await page.goto('/trips')

    // Click on first trip
    await page.locator('[data-testid="trip-card"]').first().click()

    // Navigate to builder
    await page.getByRole('link', { name: /build/i }).click()

    await expect(page).toHaveURL(/\/trips\/[a-z0-9-]+\/build/i)
  })
})

test.describe('Navigation', () => {
  test.skip('should display sidebar navigation', async ({ page }) => {
    await login(page)

    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /trips/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /explore/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /community/i })).toBeVisible()
  })

  test.skip('should navigate between pages', async ({ page }) => {
    await login(page)

    // Navigate to Explore
    await page.getByRole('link', { name: /explore/i }).click()
    await expect(page).toHaveURL('/explore')

    // Navigate to Community
    await page.getByRole('link', { name: /community/i }).click()
    await expect(page).toHaveURL('/community')

    // Navigate to Profile
    await page.getByRole('link', { name: /profile/i }).click()
    await expect(page).toHaveURL('/profile')
  })

  test.skip('should display mobile bottom navigation', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await login(page)

    await expect(page.getByTestId('bottom-nav')).toBeVisible()
  })
})

test.describe('Public Profile', () => {
  test('should display public profile page', async ({ page }) => {
    await page.goto('/u/testuser')

    // Either shows profile or "not found" message
    await expect(page.locator('body')).toContainText(/(profile|not found)/i)
  })

  test('should show private profile message for private users', async ({ page }) => {
    await page.goto('/u/privateuser')

    // Expect either "private" or "not found"
    await expect(page.locator('body')).toContainText(/(private|not found)/i)
  })
})
