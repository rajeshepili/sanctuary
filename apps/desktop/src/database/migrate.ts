import { migrate } from 'drizzle-orm/libsql/migrator'
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import { config } from 'dotenv'

config({ path: ['.env.local', '.env'] })

const dbUrl = process.env.DATABASE_URL || 'file:dev.db'

console.log(`Running migrations on database: ${dbUrl}...`)

const client = createClient({ url: dbUrl })
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
