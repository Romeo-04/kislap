// D11 (issue #35): docs/assets.md lists everything Kislap ships that the team did not make.
// This test keeps the register honest: a new library or a new public/ file fails it until listed.
import { execSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = join(__dirname, '..', '..')
const register = readFileSync(join(root, 'docs', 'assets.md'), 'utf8')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
}
const listed = (name: string) => register.includes(`\`${name}\``)

// these dependencies of shipped libraries only run in Node, never in the browser bundle
const NODE_ONLY = new Set(['onnxruntime-node', 'sharp'])

// the service worker comes from the dev dependency vite-plugin-pwa, so no package.json line shows
// what it bundles: generateSW's runtime for the options in vite.config.ts, as found in
// dist/workbox-*.js. Add a package here when the config turns on another workbox feature
const SERVICE_WORKER = ['workbox-core', 'workbox-precaching', 'workbox-routing', 'workbox-strategies', 'workbox-expiration', 'idb']

describe('asset register (docs/assets.md)', () => {
  it('lists every dependency and dev dependency in package.json', () => {
    const names = [...Object.keys(pkg.dependencies), ...Object.keys(pkg.devDependencies)]
    expect(names.filter((n) => !listed(n))).toEqual([])
  })

  // one level down only: deeper packages (onnxruntime-web's own dependencies) are not checked
  it('lists what each shipped library brings into the browser', () => {
    const missing = Object.keys(pkg.dependencies).flatMap((dep) => {
      const file = join(root, 'node_modules', dep, 'package.json')
      if (!existsSync(file)) throw new Error(`${dep} is not installed: run npm ci first`)
      const own = JSON.parse(readFileSync(file, 'utf8')) as { dependencies?: Record<string, string> }
      return Object.keys(own.dependencies ?? {}).filter((n) => !NODE_ONLY.has(n) && !listed(n))
    })
    expect(missing).toEqual([])
  })

  it('lists what the service worker bundles', () => {
    expect(SERVICE_WORKER.filter((n) => !listed(n))).toEqual([])
  })

  // tracked files only: a gitignored dev folder (public/models/) never ships
  it('lists every committed file or folder in public/', () => {
    const files = execSync('git ls-files public', { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean)
    const paths = new Set(files.map((f) => (f.split('/').length > 2 ? f.slice(0, f.lastIndexOf('/') + 1) : f)))
    // a folder must appear with its trailing slash, so public/sticker/ is not covered by public/stickers/
    expect([...paths].filter((p) => !register.includes(p))).toEqual([])
  })
})
