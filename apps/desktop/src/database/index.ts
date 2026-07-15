import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { createClient } from '@libsql/client'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import * as schema from './schema.ts'

import { seedDatabase } from './seed'
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
  const url = process.env.DATABASE_URL
  if (process.env.VERCEL && !url) {
    throw new Error(
      'DATABASE_URL is required on Vercel for proper DB setup (e.g. Turso). Do not fallback to local file DB.',
    )
  }

  return createClient({
    url: url || 'file:dev.db',
    // Required for Turso cloud databases; undefined is ignored for local file DBs
    authToken: process.env.TURSO_AUTH_TOKEN,
  })
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

      // Performance PRAGMAs — local file DBs only.
      // Turso/libsql remote connections ignore these and may error; skip them.
      const isLocalDb = !process.env.DATABASE_URL?.startsWith('libsql://')
      if (isLocalDb) {
        await client.execute('PRAGMA journal_mode=WAL')
        await client.execute('PRAGMA synchronous=NORMAL')
        await client.execute('PRAGMA busy_timeout=5000')
        await client.execute('PRAGMA cache_size=-20000')
        await client.execute('PRAGMA mmap_size=2147483648')
      }
      // Referential integrity works on both local and Turso
      await client.execute('PRAGMA foreign_keys=ON')

      // Migrations are run at build time on Vercel (via buildCommand).
      // Skip them at runtime to avoid needing the migrations folder bundled in the function.
      if (!process.env.VERCEL) {
        await migrate(db, {
          migrationsFolder: process.env.MIGRATIONS_PATH || './drizzle',
        })
      }
      await seedDatabase(db)

      dbInstance = db
      databaseStatus = 'ready'

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
  dbInstance = null
  initPromise = null
  lastError = null
  databaseStatus = 'idle'
}
