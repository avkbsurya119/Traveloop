import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('should display login page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /create account/i })).toBeVisible()
  })

  test('should show validation errors for empty form', async ({ page }) => {
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page.getByText(/email required/i)).toBeVisible()
    await expect(page.getByText(/password required/i)).toBeVisible()
  })

  test('should show error for invalid email format', async ({ page }) => {
    await page.getByLabel(/email/i).fill('notanemail')
    await page.getByLabel(/password/i).fill('password123')
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page.getByText(/invalid email/i)).toBeVisible()
  })

  test('should show error for short password', async ({ page }) => {
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/password/i).fill('short')
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page.getByText(/min 8 characters/i)).toBeVisible()
  })

  test('should navigate to register page', async ({ page }) => {
    await page.getByRole('link', { name: /create account/i }).click()

    await expect(page).toHaveURL('/register')
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible()
  })

  test('should navigate to forgot password', async ({ page }) => {
    await page.getByRole('link', { name: /forgot password/i }).click()

    await expect(page).toHaveURL('/forgot-password')
  })

  test('should show Google sign-in option', async ({ page }) => {
    await expect(page.getByRole('link', { name: /sign in with google/i })).toBeVisible()
  })

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.getByLabel(/password/i)
    await passwordInput.fill('mypassword')

    // Initially password type
    await expect(passwordInput).toHaveAttribute('type', 'password')

    // Click eye icon to show password
    await page.locator('button').filter({ has: page.locator('[data-lucide="eye"]') }).click()
    await expect(passwordInput).toHaveAttribute('type', 'text')

    // Click again to hide
    await page.locator('button').filter({ has: page.locator('[data-lucide="eye-off"]') }).click()
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })
})

test.describe('Registration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register')
  })

  test('should display registration form', async ({ page }) => {
    await expect(page.getByLabel(/first name/i)).toBeVisible()
    await expect(page.getByLabel(/last name/i)).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    await page.getByRole('button', { name: /create account/i }).click()

    await expect(page.getByText(/first name required/i)).toBeVisible()
  })

  test('should navigate to login', async ({ page }) => {
    await page.getByRole('link', { name: /sign in/i }).click()

    await expect(page).toHaveURL('/login')
  })
})
