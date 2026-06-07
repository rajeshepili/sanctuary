/**
 * Test Runner Script
 * Runs all tests with proper setup and reporting
 */

import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const args = process.argv.slice(2)
const testType = args[0] || 'all'

const rootDir = resolve(__dirname, '..')

console.log(`\n🚀 Running ${testType} tests...\n`)

try {
  switch (testType) {
    case 'unit':
      console.log('📝 Running unit tests...\n')
      execSync(
        'vitest run --exclude "**/*.integration.test.ts" --exclude "**/database.perf.test.ts"',
        {
          stdio: 'inherit',
          cwd: rootDir,
        },
      )
      break

    case 'integration':
      console.log('📝 Running integration tests...\n')
      execSync('vitest run integration.test', {
        stdio: 'inherit',
        cwd: rootDir,
      })
      break

    case 'all':
      console.log('📝 Running all tests...\n')
      console.log('1/2: Unit tests')
      execSync(
        'vitest run --exclude "**/*.integration.test.ts" --exclude "**/database.perf.test.ts"',
        {
          stdio: 'inherit',
          cwd: rootDir,
        },
      )

      console.log('\n2/2: Integration tests')
      execSync('vitest run integration.test', {
        stdio: 'inherit',
        cwd: rootDir,
      })

      console.log('\n✅ All tests passed!')
      break

    case 'watch':
      console.log('📝 Running tests in watch mode...\n')
      execSync('vitest', {
        stdio: 'inherit',
        cwd: rootDir,
      })
      break

    case 'coverage':
      console.log('📝 Running tests with coverage...\n')
      execSync('vitest run --coverage', {
        stdio: 'inherit',
        cwd: rootDir,
      })
      break

    default:
      console.error(`Unknown test type: ${testType}`)
      console.error('Available types: unit, integration, all, watch, coverage')
      process.exit(1)
  }
} catch (error) {
  console.error('\n❌ Tests failed!')
  process.exit(1)
}
