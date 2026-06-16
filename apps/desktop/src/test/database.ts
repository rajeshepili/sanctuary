import os from 'node:os'
import path from 'node:path'
import { drizzle } from 'drizzle-orm/libsql'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import type { Client } from '@libsql/client'
import * as schema from '#/database/schema'
import { applyTestSchemaAsync } from '#/test/apply-test-schema'
import { migrateTestDatabase } from '#/test/migrate-test-db'

const clientByOrm = new WeakMap<LibSQLDatabase<typeof schema>, Client>()

let sharedTestDb: LibSQLDatabase<typeof schema> | null = null

async function initTestOrm(
  client: Client,
  useMigrations: boolean,
): Promise<LibSQLDatabase<typeof schema>> {
  console.log(`initTestOrm: useMigrations=${useMigrations}`)
  if (useMigrations) {
    const orm = drizzle(client, { schema })
    try {
      await migrateTestDatabase(orm)
      console.log('initTestOrm: migrations applied')
    } catch (err) {
      console.error('initTestOrm: migrations failed', err)
      throw err
    }
    clientByOrm.set(orm, client)
    return orm
  }

  try {
    console.log('initTestOrm: applying manual schema...')
    await applyTestSchemaAsync((sql) => client.executeMultiple(sql))
    console.log('initTestOrm: manual schema applied')
  } catch (err) {
    console.error('initTestOrm: manual schema failed', err)
    throw err
  }
  const orm = drizzle(client, { schema })
  clientByOrm.set(orm, client)
  return orm
}

/**
 * Retrieves a shared temp-file SQLite database for integration tests (libsql).
 * The database instance is cached and shared across the test file.
 */
export async function getSharedTestDatabase(): Promise<
  LibSQLDatabase<typeof schema>
> {
  if (sharedTestDb) {
    return sharedTestDb
  }

  const dbPath = path.join(os.tmpdir(), `sanctuary-test-${Math.random().toString(36).slice(2)}.db`)
  const client = createClient({ url: `file:${dbPath}` })
  sharedTestDb = await initTestOrm(client, false)
  return sharedTestDb
}

/**
 * Fresh in-memory database per test file — uses manual schema application.
 */
export async function createIsolatedTestDatabase(): Promise<
  LibSQLDatabase<typeof schema>
> {
  const dbPath = path.join(os.tmpdir(), `sanctuary-test-${Math.random().toString(36).slice(2)}.db`)
  const client = createClient({ url: `file:${dbPath}` })
  return initTestOrm(client, false)
}

/**
 * Resets the test database by clearing all tables
 */
export async function resetTestDatabase(
  db: LibSQLDatabase<typeof schema> | undefined,
) {
  if (!db) return

  const client = clientByOrm.get(db)
  if (!client) return

  await client.executeMultiple(`
    DELETE FROM habit_completions;
    DELETE FROM entry_media;
    DELETE FROM habits;
    DELETE FROM journal_entries;
    DELETE FROM custom_prompts;
    DELETE FROM user_preferences;
  `)
}
