import { migrate } from 'drizzle-orm/libsql/migrator'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { existsSync } from 'node:fs'
import type * as schema from '#/database/schema'

const __dirname = dirname(fileURLToPath(import.meta.url))
const migrationsFolder = resolve(__dirname, '../../drizzle')

export async function migrateTestDatabase(
  db: LibSQLDatabase<typeof schema>,
): Promise<void> {
  if (!existsSync(migrationsFolder)) {
    throw new Error(`Migrations folder not found at: ${migrationsFolder}`)
  }
  await migrate(db, { migrationsFolder })
}
