import { describe, expect, it } from 'vitest'
import { execFileSync, spawnSync } from 'node:child_process'
import { chmodSync, existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const root = resolve(__dirname, '..')

function read(path: string) {
  return readFileSync(resolve(root, path), 'utf8')
}

function pngDimensions(path: string) {
  const bytes = readFileSync(path)
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  }
}

describe('Chrome Web Store release configuration', () => {
  it('uses package.json as the v0.1.1 version authority', () => {
    const packageJson = JSON.parse(read('package.json'))

    expect(packageJson.version).toBe('0.1.1')
    expect(packageJson.scripts).toMatchObject({
      'build:github': 'MERCURY_DISTRIBUTION_TARGET=github wxt build',
      'build:chrome-web-store': 'MERCURY_DISTRIBUTION_TARGET=chrome-web-store wxt build',
      'zip:github': 'MERCURY_DISTRIBUTION_TARGET=github wxt zip',
      'zip:chrome-web-store': 'MERCURY_DISTRIBUTION_TARGET=chrome-web-store wxt zip',
      'release:artifacts': 'node scripts/build-release-artifacts.mjs',
      'release:check': 'node scripts/check-release-readiness.mjs',
    })
  })

  it('keeps the GitHub key only for the GitHub distribution target', () => {
    const config = read('wxt.config.ts')

    expect(config).toContain("process.env.MERCURY_DISTRIBUTION_TARGET === 'chrome-web-store'")
    expect(config).toContain("distributionTarget === 'github'")
    expect(config).toContain('stableGithubReleaseKey')
    expect(config).not.toContain('update_url')
  })

  it('defines the Mercury size baseline and release growth gates', () => {
    const core = read('scripts/release-readiness-core.mjs')

    expect(core).toContain('V010_GITHUB_ZIP_BASELINE_BYTES = 4_860_119')
    expect(core).toContain('SIZE_WARNING_RATIO = 1.15')
    expect(core).toContain('SIZE_FAILURE_RATIO = 1.25')
  })

  it('builds deterministic source archives only from clean committed source', () => {
    const builder = read('scripts/build-release-artifacts.mjs')
    const core = read('scripts/release-readiness-core.mjs')

    expect(builder).toContain("git', ['status', '--porcelain', '--untracked-files=all']")
    expect(builder).toContain('Refusing to build release source archive from a dirty worktree.')
    expect(builder).toContain("'git', ['archive', '--format=zip'")
    expect(builder).toContain('`${packageJson.name}-${version}-chrome.zip`')
    expect(builder).toContain("rmSync(wxtZip, { force: true })")
    expect(builder).toContain("execFileSync('unzip', ['-t', path]")
    expect(builder).toContain('verifyZip(wxtZip)')
    expect(builder).toContain('verifyZip(releaseZip)')
    expect(builder).toContain('--prefix=mercury-translate-${tag}/')
    expect(builder).toContain('--output=${sourceZip}')
    expect(core).toContain('const prefix = `mercury-translate-v${version}/`')
    expect(core).toContain("readZipEntry(sourceZip, `${prefix}package.json`)")
    expect(core).toContain("readZipEntry(sourceZip, `${prefix}${file}`)")
    expect(core).toContain("return JSON.parse(readZipEntry(zipPath, 'manifest.json'))")
    expect(core).not.toContain("['-q', zipPath, '-d', destination]")
  })

  it('refuses a dirty source tree before touching existing release artifacts', () => {
    const fixture = mkdtempSync(join(tmpdir(), 'mercury-dirty-release-'))
    const releaseDir = join(fixture, 'release')
    const marker = join(releaseDir, 'existing-artifact.zip')
    try {
      execFileSync('git', ['init', '-q'], {cwd: fixture})
      writeFileSync(join(fixture, 'package.json'), JSON.stringify({name: 'fixture', version: '0.1.1'}))
      mkdirSync(releaseDir)
      writeFileSync(marker, 'keep-me')

      const result = spawnSync(process.execPath, [resolve(root, 'scripts/build-release-artifacts.mjs')], {
        cwd: fixture,
        encoding: 'utf8',
      })

      expect(result.status).not.toBe(0)
      expect(result.stderr).toContain('Refusing to build release source archive from a dirty worktree.')
      expect(readFileSync(marker, 'utf8')).toBe('keep-me')
    } finally {
      rmSync(fixture, {recursive: true, force: true})
    }
  })

  it('preserves the currently installed unpacked extension directory when rebuilding release artifacts', () => {
    const fixture = mkdtempSync(join(tmpdir(), 'mercury-unpacked-release-'))
    const releaseDir = join(fixture, 'release')
    const unpackedDir = join(releaseDir, 'mercury-translate-v0.1.1-unpacked')
    const staleArtifact = join(releaseDir, 'old-artifact.zip')
    const fakeBin = join(fixture, 'bin')
    try {
      mkdirSync(fakeBin)
      writeFileSync(
        join(fakeBin, 'pnpm'),
        [
          '#!/usr/bin/env node',
          "const {execFileSync} = require('node:child_process');",
          "const {mkdtempSync, mkdirSync, writeFileSync} = require('node:fs');",
          "const {tmpdir} = require('node:os');",
          "const {join, resolve} = require('node:path');",
          "mkdirSync('.output', {recursive: true});",
          "const temp = mkdtempSync(join(tmpdir(), 'mercury-wxt-zip-'));",
          "writeFileSync(join(temp, 'manifest.json'), JSON.stringify({manifest_version: 3, name: 'Mercury Translate', version: '0.1.1'}));",
          "execFileSync('zip', ['-q', resolve('.output/mercury-translate-0.1.1-chrome.zip'), 'manifest.json'], {cwd: temp});",
        ].join('\n'),
      )
      chmodSync(join(fakeBin, 'pnpm'), 0o755)

      execFileSync('git', ['init', '-q'], {cwd: fixture})
      writeFileSync(join(fixture, '.gitignore'), 'release/\n.output/\n')
      writeFileSync(join(fixture, 'package.json'), JSON.stringify({name: 'mercury-translate', version: '0.1.1'}))
      for (const file of ['LICENSE', 'NOTICE', 'THIRD_PARTY_NOTICES.md', 'INSTALL.md']) {
        writeFileSync(join(fixture, file), `${file}\n`)
      }
      execFileSync('git', ['add', '.'], {cwd: fixture})
      execFileSync('git', ['-c', 'user.name=Mercury Test', '-c', 'user.email=mercury@example.invalid', 'commit', '-qm', 'fixture'], {cwd: fixture})

      mkdirSync(unpackedDir, {recursive: true})
      writeFileSync(join(unpackedDir, 'manifest.json'), 'installed-copy')
      writeFileSync(staleArtifact, 'remove-me')

      const result = spawnSync(process.execPath, [resolve(root, 'scripts/build-release-artifacts.mjs')], {
        cwd: fixture,
        encoding: 'utf8',
        env: {...process.env, PATH: `${fakeBin}:${process.env.PATH || ''}`},
      })

      expect(result.status).toBe(0)
      expect(readFileSync(join(unpackedDir, 'manifest.json'), 'utf8')).toBe('installed-copy')
      expect(existsSync(staleArtifact)).toBe(false)
      expect(existsSync(join(releaseDir, 'mercury-translate-v0.1.1-chrome.zip'))).toBe(true)
      expect(existsSync(join(releaseDir, 'mercury-translate-v0.1.1-chrome-web-store.zip'))).toBe(true)
      expect(readFileSync(join(releaseDir, 'SHA256SUMS'), 'utf8')).not.toContain('mercury-translate-v0.1.1-unpacked')
    } finally {
      rmSync(fixture, {recursive: true, force: true})
    }
  })

  it('keeps Chrome Web Store listing copy and privacy claims free of paid automation', () => {
    const listing = [
      read('store-assets/chrome-web-store/listing.en.md'),
      read('store-assets/chrome-web-store/listing.zh-CN.md'),
      read('store-assets/chrome-web-store/listing.zh-TW.md'),
      read('store-assets/chrome-web-store/privacy-declarations.md'),
      read('store-assets/chrome-web-store/README.md'),
    ].join('\n')

    expect(listing).toContain('Unlisted')
    expect(listing).toContain('no telemetry')
    expect(listing).toContain('no subscription')
    expect(listing).toContain('No Chrome Web Store API key')
    expect(listing).toContain('service account')
    expect(listing).toContain('Select **No, I am not using remote code**')
    expect(listing).toContain('The repository owner must personally confirm')
    expect(listing).not.toMatch(/chrome-webstore-upload|CWS API v1|paid API/i)
  })

  it('rejects common remote executable-code variants in a packaged ZIP', async () => {
    // The release helper is an ESM build script and intentionally has no
    // application-facing TypeScript surface.
    // @ts-expect-error runtime import of the release helper
    const {assertNoRemoteExecutableCode} = await import('../scripts/release-readiness-core.mjs')
    const fixture = mkdtempSync(join(tmpdir(), 'mercury-remote-code-'))
    try {
      writeFileSync(join(fixture, 'safe.js'), 'const endpoint = "https://api.example.invalid/v1";')
      writeFileSync(join(fixture, 'unsafe.js'), 'const worker = new SharedWorker ( "//cdn.example.invalid/worker.js" );')
      execFileSync('zip', ['-q', 'safe.zip', 'safe.js'], {cwd: fixture})
      execFileSync('zip', ['-q', 'unsafe.zip', 'unsafe.js'], {cwd: fixture})

      expect(() => assertNoRemoteExecutableCode(join(fixture, 'safe.zip'))).not.toThrow()
      expect(() => assertNoRemoteExecutableCode(join(fixture, 'unsafe.zip'))).toThrow('contains remote executable code')
    } finally {
      rmSync(fixture, {recursive: true, force: true})
    }
  })

  it('has store image assets with Chrome Web Store dimensions', () => {
    expect(pngDimensions(resolve(root, 'store-assets/chrome-web-store/icon-128.png'))).toEqual({
      width: 128,
      height: 128,
    })
    expect(pngDimensions(resolve(root, 'store-assets/chrome-web-store/small-promo-tile.png'))).toEqual({
      width: 440,
      height: 280,
    })

    const screenshots = [
      '01-webpage-bilingual.png',
      '02-youtube-subtitles.png',
      '03-pdf-reader.png',
      '04-image-ocr.png',
      '05-services-privacy.png',
    ]
    for (const screenshot of screenshots) {
      expect(pngDimensions(resolve(root, 'store-assets/chrome-web-store/screenshots', screenshot))).toEqual({
        width: 1280,
        height: 800,
      })
    }
  })

  it('keeps CI on free artifact preparation without Chrome Web Store submission', () => {
    const workflow = read('.github/workflows/ci-release.yml')

    expect(workflow).toContain('pnpm release:artifacts')
    expect(workflow).toContain('pnpm release:check')
    expect(workflow).toContain("find . -maxdepth 1 -type f ! -name SHA256SUMS")
    expect(workflow).not.toMatch(/chromewebstore|client_secret|refresh_token|webstore upload/i)
  })
})
