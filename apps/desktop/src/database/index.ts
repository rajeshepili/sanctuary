import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { createClient } from '@libsql/client'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import * as schema from './schema.ts'

import { seedDatabase } from './seed'
import { startBackgroundJobs, stopBackgroundJobs } from './jobs'
import { DatabaseError } from '#/lib/errors'

export type Database = LibSQLDatabase<typeof schema>

let dbInstance: Database | null = null
let initPromise: Promise<Database> | null = null
let lastError: Error | null = null

/** For testing only — inject a pre-built db instance to bypass real initialization. */
export function setDb(instance: Database) {
  console.log('setDb: setting db instance')
  dbInstance = instance
  initPromise = null
  databaseStatus = 'ready'
}

export type DatabaseStatus = 'idle' | 'ready' | 'error'

export let databaseStatus: DatabaseStatus = 'idle'

function createClientInstance() {
  return createClient({ url: process.env.DATABASE_URL || 'file:dev.db' })
}

export async function initializeDatabase(): Promise<Database> {
  if (dbInstance) {
    console.log('initializeDatabase: returning existing dbInstance')
    databaseStatus = 'ready'
    return dbInstance
  }

  if (initPromise) {
    console.log('initializeDatabase: returning existing initPromise')
    return initPromise
  }

  console.log('initializeDatabase: starting initialization...')
  initPromise = (async () => {
    try {
      const client = createClientInstance()
      const db = drizzle(client, { schema })

      await client.execute('PRAGMA journal_mode=WAL')
      await client.execute('PRAGMA synchronous=NORMAL')
      await client.execute('PRAGMA foreign_keys=ON')
      await client.execute('PRAGMA busy_timeout=5000')
      await client.execute('PRAGMA cache_size=-20000')
      await client.execute('PRAGMA mmap_size=2147483648')

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
        error instanceof DatabaseError
          ? error
          : new DatabaseError(
              error instanceof Error
                ? error.message
                : 'Database initialization failed',
              error,
            )

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
