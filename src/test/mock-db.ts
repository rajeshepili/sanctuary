import { vi } from 'vitest'
import type { MockInstance } from 'vitest'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import type * as schema from '#/database/schema'
import * as database from '#/database'

export function mockGetDb(
  db: LibSQLDatabase<typeof schema>,
): MockInstance<typeof database.getDb> {
  return vi.spyOn(database, 'getDb').mockResolvedValue(db)
}
