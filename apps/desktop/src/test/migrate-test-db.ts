import { migrate } from 'drizzle-orm/libsql/migrator'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type * as schema from '#/database/schema'

const migrationsFolder = resolve(
  fileURLToPath(import.meta.url),
  '../../../drizzle',
)

export async function migrateTestDatabase(
  db: LibSQLDatabase<typeof schema>,
): Promise<void> {
  await migrate(db, { migrationsFolder })
}
