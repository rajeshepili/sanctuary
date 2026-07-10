#!/usr/bin/env node
/**
 * Scaffold a new feature module under src/features/<name>/.
 *
 * Usage:
 *   pnpm feature:create reminders
 *   pnpm feature:create reminders --route /reminders
 */

import { mkdir, writeFile, access } from 'node:fs/promises'
import { constants } from 'node:fs'
import { resolve, join } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const featuresDir = join(root, 'src', 'features')
const routesDir = join(root, 'src', 'routes', '__app')

function parseArgs(argv) {
  const positional = []
  let route

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--route' && argv[i + 1]) {
      route = argv[++i]
    } else if (!argv[i].startsWith('-')) {
      positional.push(argv[i])
    }
  }

  return { name: positional[0], route }
}

function toPascalCase(value) {
  return value
    .split(/[-_]/g)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

function assertKebabName(name) {
  if (!name || !/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name)) {
    console.error(
      'Feature name must be kebab-case, e.g. "reminders" or "daily-notes".',
    )
    process.exit(1)
  }
}

async function exists(path) {
  try {
    await access(path, constants.F_OK)
    return true
  } catch {
    return false
  }
}

function schemaTemplate(name) {
  return `import z from 'zod'

export const create${toPascalCase(name)}Schema = z.object({
  // TODO: define input fields
})

export type Create${toPascalCase(name)}Input = z.infer<typeof create${toPascalCase(name)}Schema>
`
}

function serviceTemplate(name) {
  return `import { getDb } from '#/database'

export async function getAll${toPascalCase(name)}Service() {
  const db = await getDb()
  // TODO: implement query
  return []
}
`
}

function apiTemplate(name) {
  const pascal = toPascalCase(name)
  return `import { createServerFn } from '@tanstack/react-start'
import { getAll${pascal}Service } from './${name}.service'

export const getAll${pascal} = createServerFn({ method: 'GET' }).handler(() =>
  getAll${pascal}Service(),
)
`
}

function keysTemplate(name) {
  return `export const ${name}Keys = {
  all: ['${name}'] as const,
}
`
}

function optionsTemplate(name) {
  const pascal = toPascalCase(name)
  return `import { queryOptions } from '@tanstack/react-query'
import { ${name}Keys } from './${name}.keys'
import { getAll${pascal} } from './${name}.api'
import { withTimeout } from '#/lib/with-timeout'

export const ${name}QueryOptions = () =>
  queryOptions({
    queryKey: ${name}Keys.all,
    queryFn: () =>
      withTimeout(() => getAll${pascal}(), { name: 'getAll${pascal}' }),
  })
`
}

function queriesTemplate(name) {
  const pascal = toPascalCase(name)
  return `import { useSuspenseQuery } from '@tanstack/react-query'
import { ${name}QueryOptions } from './${name}.options'

export function use${pascal}Queries() {
  const { data } = useSuspenseQuery(${name}QueryOptions())
  return { items: data }
}
`
}

function cacheTemplate(name) {
  return `import type { QueryClient } from '@tanstack/react-query'
import { ${name}Keys } from './${name}.keys'

export const ${name}Cache = {
  invalidate(queryClient: QueryClient) {
    queryClient.invalidateQueries({ queryKey: ${name}Keys.all })
  },
}
`
}

function mutationsTemplate(name) {
  const pascal = toPascalCase(name)
  return `import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ${name}Cache } from './${name}.cache'

export function use${pascal}Mutations() {
  const queryClient = useQueryClient()

  const refresh = useCallback(() => {
    ${name}Cache.invalidate(queryClient)
  }, [queryClient])

  return { refresh }
}
`
}

function serviceTestTemplate(name) {
  const pascal = toPascalCase(name)
  return `import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import * as schema from '#/database/schema'
import { createIsolatedTestDatabase } from '#/test/database'
import { mockGetDb } from '#/test/mock-db'
import { getAll${pascal}Service } from './${name}.service'

describe('${pascal} service', () => {
  let db: LibSQLDatabase<typeof schema>
  let getDbSpy: ReturnType<typeof mockGetDb>

  beforeEach(async () => {
    db = await createIsolatedTestDatabase()
    getDbSpy = mockGetDb(db)
  })

  afterEach(() => {
    getDbSpy.mockRestore()
  })

  it('returns the expected default result', async () => {
    const result = await getAll${pascal}Service()
    expect(result).toEqual([])
  })
})
`
}

function routeTemplate(name, routePath) {
  const pascal = toPascalCase(name)
  const fileBase = routePath.replace(/^\//, '').replace(/\//g, '-') || name
  return `import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/__app/${fileBase}')({
  component: ${pascal}Page,
})

function ${pascal}Page() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">${pascal}</h1>
      <p className="text-muted-foreground mt-2">
        TODO: implement ${name} feature UI under src/features/${name}/components/
      </p>
    </div>
  )
}
`
}

async function main() {
  const { name, route } = parseArgs(process.argv.slice(2))
  assertKebabName(name)

  const featureDir = join(featuresDir, name)
  if (await exists(featureDir)) {
    console.error(`Feature already exists: src/features/${name}`)
    process.exit(1)
  }

  const routePath = route ?? `/${name}`
  const routeFileName = `${routePath.replace(/^\//, '').replace(/\//g, '-') || name}.tsx`
  const routeFile = join(routesDir, routeFileName)

  await mkdir(join(featureDir, 'components'), { recursive: true })

  const files = [
    [`${name}.schema.ts`, schemaTemplate(name)],
    [`${name}.service.ts`, serviceTemplate(name)],
    [`${name}.api.ts`, apiTemplate(name)],
    [`${name}.keys.ts`, keysTemplate(name)],
    [`${name}.options.ts`, optionsTemplate(name)],
    [`${name}.queries.ts`, queriesTemplate(name)],
    [`${name}.cache.ts`, cacheTemplate(name)],
    [`${name}.mutations.ts`, mutationsTemplate(name)],
    [`${name}.service.test.ts`, serviceTestTemplate(name)],
  ]

  for (const [fileName, contents] of files) {
    await writeFile(join(featureDir, fileName), contents, 'utf8')
  }

  await writeFile(join(featureDir, 'components', '.gitkeep'), '', 'utf8')

  if (!(await exists(routeFile))) {
    await writeFile(routeFile, routeTemplate(name, routePath), 'utf8')
  }

  console.log(`\nCreated feature module: src/features/${name}/`)
  console.log(`Route stub: src/routes/__app/${routeFileName}`)
  console.log('\nNext steps:')
  console.log(`  1. Add schema + migration if the feature needs new tables`)
  console.log(`  2. Implement ${name}.service.ts and wire ${name}.api.ts`)
  console.log(`  3. Build UI in src/features/${name}/components/`)
  console.log(
    `  4. Optional: add { to: '${routePath}', label: '${toPascalCase(name)}' } to NAV_LINKS in src/config/branding.ts`,
  )
  console.log(`  5. Run pnpm test:unit and pnpm typecheck\n`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
