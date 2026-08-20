import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { readJson } from './release-readiness-core.mjs'

const root = process.cwd()
const packageJson = readJson(join(root, 'package.json'))
const version = packageJson.version
const tag = `v${version}`
const outputDir = join(root, '.output')
const releaseDir = join(root, 'release')

function run(command, args, env = {}) {
  execFileSync(command, args, {
    cwd: root,
    env: { ...process.env, ...env },
    stdio: 'inherit',
  })
}

function verifyZip(path) {
  execFileSync('unzip', ['-t', path], { cwd: root, stdio: 'ignore' })
}

function expectedWxtZip() {
  return join(outputDir, `${packageJson.name}-${version}-chrome.zip`)
}

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

function isPreservedUnpackedInstallDir(file) {
  return /^mercury-translate-v[^/]+-unpacked$/.test(file)
}

function copyDistribution(target, fileName) {
  const wxtZip = expectedWxtZip()
  // Prove the next artifact came from this invocation rather than accepting a
  // stale ignored ZIP with a similar name from a reused local workspace.
  rmSync(wxtZip, { force: true })
  run('pnpm', ['exec', 'wxt', 'zip'], { MERCURY_DISTRIBUTION_TARGET: target })
  if (!existsSync(wxtZip)) throw new Error(`WXT did not produce ${wxtZip}`)
  verifyZip(wxtZip)
  const releaseZip = join(releaseDir, fileName)
  copyFileSync(wxtZip, releaseZip)
  verifyZip(releaseZip)
}

function assertCleanSourceTree() {
  const status = execFileSync('git', ['status', '--porcelain', '--untracked-files=all'], {
    cwd: root,
    encoding: 'utf8',
  }).trim()
  if (status) {
    throw new Error(
      [
        'Refusing to build release source archive from a dirty worktree.',
        'Commit or remove pending source changes, then rerun pnpm release:artifacts.',
        status,
      ].join('\n'),
    )
  }
}

assertCleanSourceTree()

mkdirSync(releaseDir, { recursive: true })
for (const file of readdirSync(releaseDir)) {
  if (isPreservedUnpackedInstallDir(file)) continue
  rmSync(join(releaseDir, file), { recursive: true, force: true })
}

copyDistribution('github', `mercury-translate-${tag}-chrome.zip`)
copyDistribution('chrome-web-store', `mercury-translate-${tag}-chrome-web-store.zip`)

const sourceZip = join(releaseDir, `mercury-translate-${tag}-source.zip`)
run('git', ['archive', '--format=zip', `--prefix=mercury-translate-${tag}/`, `--output=${sourceZip}`, 'HEAD'])

const licenseOutput = join(releaseDir, 'LICENSES.md')
const licenseFiles = ['LICENSE', 'NOTICE', 'THIRD_PARTY_NOTICES.md', 'INSTALL.md'].filter((file) => existsSync(join(root, file)))
for (const file of licenseFiles) copyFileSync(join(root, file), join(releaseDir, file))
writeFileSync(
  licenseOutput,
  [
    '# Mercury Translate license manifest',
    '',
    `Version: ${version}`,
    '',
    ...licenseFiles.flatMap((file) => [
      `## ${file}`,
      '',
      readFileSync(join(root, file), 'utf8').trim(),
      '',
    ]),
  ].join('\n'),
)

const releaseFiles = readdirSync(releaseDir)
  .filter((file) => file !== 'SHA256SUMS')
  .filter((file) => !isPreservedUnpackedInstallDir(file))
  .sort()

writeFileSync(
  join(releaseDir, 'SHA256SUMS'),
  releaseFiles.map((file) => `${sha256(join(releaseDir, file))}  ${file}`).join('\n') + '\n',
)

console.log(`Built Mercury Translate ${tag} release artifacts in ${releaseDir}`)
