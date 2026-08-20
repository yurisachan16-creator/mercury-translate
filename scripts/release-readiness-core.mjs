import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { basename, join } from 'node:path'
import { createHash } from 'node:crypto'

export const V010_GITHUB_ZIP_BASELINE_BYTES = 4_860_119
export const SIZE_WARNING_RATIO = 1.15
export const SIZE_FAILURE_RATIO = 1.25

export function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

export function pngDimensions(path) {
  const bytes = readFileSync(path)
  if (bytes.length < 24 || bytes.toString('ascii', 1, 4) !== 'PNG') {
    throw new Error(`${path} is not a PNG file`)
  }
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  }
}

export function assertPngSize(path, width, height) {
  const actual = pngDimensions(path)
  if (actual.width !== width || actual.height !== height) {
    throw new Error(`${path} must be ${width}x${height}; got ${actual.width}x${actual.height}`)
  }
}

export function readManifestFromZip(zipPath) {
  // Read one known entry without materializing attacker-controlled archive
  // paths or symlinks on disk.
  return JSON.parse(readZipEntry(zipPath, 'manifest.json'))
}

export function readZipEntry(zipPath, entryPath) {
  return execFileSync('unzip', ['-p', zipPath, entryPath], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
}

export function listZip(zipPath) {
  return execFileSync('unzip', ['-Z1', zipPath], { encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter(Boolean)
}

export function assertNoRemoteExecutableCode(zipPath) {
  const entries = listZip(zipPath).filter((entry) => /\.(js|mjs|cjs|html)$/i.test(entry))
  for (const entry of entries) {
    const content = execFileSync('unzip', ['-p', zipPath, entry], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
    const forbidden = [
      /<script\b[^>]*\bsrc\s*=\s*["'](?:https?:)?\/\//i,
      /importScripts\s*\(\s*["'](?:https?:)?\/\//i,
      /\bimport\s*\(\s*["'](?:https?:)?\/\//i,
      /new\s+(?:Shared)?Worker\s*\(\s*["'](?:https?:)?\/\//i,
      /\b(?:script|worker)\s*\.\s*src\s*=\s*["'](?:https?:)?\/\//i,
      /\.setAttribute\s*\(\s*["']src["']\s*,\s*["'](?:https?:)?\/\//i,
      /\b(?:eval|Function)\s*\([^)]{0,200}\bfetch\s*\(/is,
    ]
    if (forbidden.some((pattern) => pattern.test(content))) {
      throw new Error(`${basename(zipPath)} contains remote executable code in ${entry}`)
    }
  }
}

export function assessArtifactSize(path, baselineBytes = V010_GITHUB_ZIP_BASELINE_BYTES) {
  const size = statSync(path).size
  const ratio = size / baselineBytes
  return {
    size,
    ratio,
    warning: ratio > SIZE_WARNING_RATIO,
    failure: ratio > SIZE_FAILURE_RATIO,
  }
}

export function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

function isPreservedUnpackedInstallDir(file) {
  return /^mercury-translate-v[^/]+-unpacked$/.test(file)
}

export function assertChecksums(outDir) {
  const checksumPath = join(outDir, 'SHA256SUMS')
  const listed = readFileSync(checksumPath, 'utf8')
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^([a-f0-9]{64})  (.+)$/)
      if (!match) throw new Error(`Invalid SHA256SUMS line: ${line}`)
      return { digest: match[1], file: match[2] }
    })

  const listedFiles = new Set(listed.map((item) => item.file))
  const releaseFiles = readdirSync(outDir)
    .filter((file) => file !== 'SHA256SUMS')
    .filter((file) => !isPreservedUnpackedInstallDir(file))
    .sort()
  for (const file of releaseFiles) {
    if (!listedFiles.has(file)) throw new Error(`SHA256SUMS does not cover ${file}`)
  }
  for (const item of listed) {
    const artifact = join(outDir, item.file)
    if (!existsSync(artifact)) throw new Error(`SHA256SUMS references missing file ${item.file}`)
    const actual = sha256(artifact)
    if (actual !== item.digest) throw new Error(`SHA-256 mismatch for ${item.file}`)
  }
}

export function assertSourceZip(sourceZip, version) {
  const prefix = `mercury-translate-v${version}/`
  const packageJson = JSON.parse(readZipEntry(sourceZip, `${prefix}package.json`))
  if (packageJson.version !== version) {
    throw new Error(`Source ZIP package.json version must be ${version}; got ${packageJson.version}`)
  }
  for (const file of ['LICENSE', 'NOTICE', 'THIRD_PARTY_NOTICES.md', 'INSTALL.md']) {
    readZipEntry(sourceZip, `${prefix}${file}`)
  }
}

export function assertDualManifestInvariants(githubZip, chromeWebStoreZip, version) {
  const githubManifest = readManifestFromZip(githubZip)
  const cwsManifest = readManifestFromZip(chromeWebStoreZip)

  if (githubManifest.version !== version || cwsManifest.version !== version) {
    throw new Error('ZIP manifest versions must match package.json')
  }
  if (!githubManifest.key) throw new Error('GitHub ZIP must keep the fixed extension key')
  if ('key' in cwsManifest) throw new Error('Chrome Web Store ZIP must not contain manifest.key')
  if ('update_url' in githubManifest || 'update_url' in cwsManifest) {
    throw new Error('Distribution ZIPs must not hard-code update_url')
  }
  if (githubManifest.minimum_chrome_version !== '151' || cwsManifest.minimum_chrome_version !== '151') {
    throw new Error('Distribution ZIPs must require Chrome 151+')
  }
  if (!cwsManifest.mime_types_handler?.['application/pdf']) {
    throw new Error('Chrome Web Store ZIP must keep the PDF MIME handler')
  }
  if ((cwsManifest.host_permissions || []).length !== 0) {
    throw new Error('Chrome Web Store ZIP must not request broad host permissions at install time')
  }
}

export function assertReleaseReadiness({ root = process.cwd(), outDir = join(process.cwd(), 'release') } = {}) {
  const packageJson = readJson(join(root, 'package.json'))
  const version = packageJson.version
  const tag = `v${version}`
  const githubZip = join(outDir, `mercury-translate-${tag}-chrome.zip`)
  const chromeWebStoreZip = join(outDir, `mercury-translate-${tag}-chrome-web-store.zip`)
  const sourceZip = join(outDir, `mercury-translate-${tag}-source.zip`)

  for (const path of [githubZip, chromeWebStoreZip, sourceZip, join(outDir, 'SHA256SUMS'), join(outDir, 'LICENSES.md')]) {
    if (!existsSync(path)) throw new Error(`Missing release artifact: ${path}`)
  }

  assertDualManifestInvariants(githubZip, chromeWebStoreZip, version)
  execFileSync('unzip', ['-t', githubZip], { stdio: 'ignore' })
  execFileSync('unzip', ['-t', chromeWebStoreZip], { stdio: 'ignore' })
  execFileSync('unzip', ['-t', sourceZip], { stdio: 'ignore' })
  assertSourceZip(sourceZip, version)
  assertChecksums(outDir)

  assertNoRemoteExecutableCode(githubZip)
  assertNoRemoteExecutableCode(chromeWebStoreZip)

  const storeRoot = join(root, 'store-assets', 'chrome-web-store')
  for (const listing of [
    'listing.en.md',
    'listing.zh-CN.md',
    'listing.zh-TW.md',
    'privacy-declarations.md',
    'README.md',
  ]) {
    if (!existsSync(join(storeRoot, listing))) throw new Error(`Missing CWS listing file: ${listing}`)
  }
  assertPngSize(join(storeRoot, 'icon-128.png'), 128, 128)
  assertPngSize(join(storeRoot, 'small-promo-tile.png'), 440, 280)
  for (const file of readdirSync(join(storeRoot, 'screenshots')).filter((item) => item.endsWith('.png'))) {
    assertPngSize(join(storeRoot, 'screenshots', file), 1280, 800)
  }
  if (readdirSync(join(storeRoot, 'screenshots')).filter((item) => item.endsWith('.png')).length !== 5) {
    throw new Error('Chrome Web Store asset pack must contain exactly five PNG screenshots')
  }

  const githubSize = assessArtifactSize(githubZip)
  const cwsSize = assessArtifactSize(chromeWebStoreZip)
  if (githubSize.failure || cwsSize.failure) {
    throw new Error('Release ZIP size grew more than 25% above the reviewed v0.1.0 baseline')
  }

  mkdirSync(outDir, { recursive: true })
  return {
    version,
    warnings: [
      githubSize.warning ? `GitHub ZIP grew to ${(githubSize.ratio * 100).toFixed(1)}% of baseline` : null,
      cwsSize.warning ? `CWS ZIP grew to ${(cwsSize.ratio * 100).toFixed(1)}% of baseline` : null,
    ].filter(Boolean),
  }
}
