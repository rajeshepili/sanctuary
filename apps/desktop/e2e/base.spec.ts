import { test, expect } from '@playwright/test'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from '../src/database/schema'
import { migrate } from 'drizzle-orm/libsql/migrator'
import path from 'path'
import { fileURLToPath } from 'url'

const client = createClient({ url: 'file:test.db' })
const db = drizzle(client, { schema })

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

test.describe('Sanctuary Base Flow', () => {
  test.beforeAll(async () => {
    // Ensure migrations are applied to the test database
    await migrate(db, {
      migrationsFolder: path.resolve(__dirname, '../drizzle'),
    })
  })

  test.beforeEach(async () => {
    // Reset database to un-onboarded state
    await db.delete(schema.userPreferences)
    await db.insert(schema.userPreferences).values({
      disclaimerAgreed: false,
    })
  })

  test('should load the onboarding flow for new users', async ({ page }) => {
    await page.goto('/')
    
    // Check for onboarding welcome text
    await expect(page.getByText(/Welcome to/i)).toBeVisible()
    await expect(page.getByText(/Sanctuary/i)).toBeVisible()
  })

  test('should allow navigating between steps in onboarding', async ({ page }) => {
    await page.goto('/')
    
    // Step 1 -> Step 2
    await page.getByRole('button', { name: /Continue/i }).click()
    await expect(page.getByText(/Personalize Your Space/i)).toBeVisible()
    
    // Step 2 -> Step 3
    await page.getByPlaceholder(/Your first name/i).fill('Test User')
    await page.getByRole('button', { name: /Continue/i }).click()
    await expect(page.getByText(/Your Dashboard/i)).toBeVisible()
  })
})
