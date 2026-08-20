import { assertReleaseReadiness } from './release-readiness-core.mjs'

try {
  const result = assertReleaseReadiness()
  for (const warning of result.warnings) console.warn(`WARNING: ${warning}`)
  console.log(`Mercury Translate ${result.version} release artifacts are ready.`)
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
