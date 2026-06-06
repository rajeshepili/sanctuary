import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { createClient } from '@libsql/client'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import * as schema from './schema.ts'

import { seedDatabase } from './seed'
import { startBackgroundJobs, stopBackgroundJobs } from './jobs'

export type Database = LibSQLDatabase<typeof schema>

let dbInstance: Database | null = null
let initPromise: Promise<Database> | null = null
let lastError: Error | null = null

export type DatabaseStatus = 'idle' | 'ready' | 'error'

export let databaseStatus: DatabaseStatus = 'idle'

function createClientInstance() {
  return createClient({ url: process.env.DATABASE_URL || 'file:dev.db' })
}

export async function initializeDatabase(): Promise<Database> {
  if (dbInstance) {
    databaseStatus = 'ready'
    return dbInstance
  }

  if (initPromise) {
    return initPromise
  }

  initPromise = (async () => {
    try {
      const client = createClientInstance()
      const db = drizzle(client, { schema })

      await client.execute('PRAGMA journal_mode=WAL')
      await client.execute('PRAGMA synchronous=NORMAL')
      await client.execute('PRAGMA foreign_keys=ON')

      await migrate(db, {
        migrationsFolder: process.env.MIGRATIONS_PATH || './drizzle',
      })
      await seedDatabase(db)

      dbInstance = db
      databaseStatus = 'ready'

      startBackgroundJobs()

      return db
    } catch (error) {
      const normalizedError =
        error instanceof Error ? error : new Error(String(error))

      lastError = normalizedError
      databaseStatus = 'error'
      initPromise = null
      throw normalizedError
    }
  })()

  return initPromise
}

export async function getDb(): Promise<Database> {
  return initializeDatabase()
}

export function getDatabaseStatus() {
  return {
    status: databaseStatus,
    lastError,
  }
}

export async function shutdownDatabase(): Promise<void> {
  stopBackgroundJobs()

  dbInstance = null
  initPromise = null
  lastError = null
  databaseStatus = 'idle'
}
