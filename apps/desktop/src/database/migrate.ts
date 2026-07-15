import { migrate } from 'drizzle-orm/libsql/migrator'
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import { config } from 'dotenv'

config({ path: ['.env.local', '.env'] })

const dbUrl = process.env.DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN

if (process.env.VERCEL && !dbUrl) {
  throw new Error(
    'DATABASE_URL is required on Vercel for proper DB setup (e.g. Turso). Do not fallback to local file DB.',
  )
}

const finalDbUrl = dbUrl || 'file:dev.db'
console.log(`Running migrations on database: ${finalDbUrl}...`)

const client = createClient({ url: finalDbUrl, authToken })
const db = drizzle(client)

try {
  await migrate(db, { migrationsFolder: './drizzle' })
  console.log('✓ Migrations applied successfully!')
  client.close()
  process.exit(0)
} catch (error) {
  console.error('✗ Migration failed:', error)
  client.close()
  process.exit(1)
}
