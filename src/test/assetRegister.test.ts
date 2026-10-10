// D11 (issue #35): docs/assets.md lists everything Kislap ships that the team did not make.
// This test keeps the register honest: a new library or a new public/ folder fails it until listed.
import { readFileSync, readdirSync } from 'node:fs'
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

describe('asset register (docs/assets.md)', () => {
  it('lists every dependency and dev dependency in package.json', () => {
    const names = [...Object.keys(pkg.dependencies), ...Object.keys(pkg.devDependencies)]
    expect(names.filter((n) => !listed(n))).toEqual([])
  })

  // one level down only: deeper packages (onnxruntime-web's own dependencies) are not checked
  it('lists what each shipped library brings into the browser', () => {
    const missing = Object.keys(pkg.dependencies).flatMap((dep) => {
      const own = JSON.parse(readFileSync(join(root, 'node_modules', dep, 'package.json'), 'utf8')) as {
        dependencies?: Record<string, string>
      }
      return Object.keys(own.dependencies ?? {}).filter((n) => !NODE_ONLY.has(n) && !listed(n))
    })
    expect(missing).toEqual([])
  })

  it('lists every folder of files in public/', () => {
    const folders = (dir: string): string[] =>
      readdirSync(join(root, dir), { withFileTypes: true }).flatMap((e) =>
        e.isDirectory() ? [`${dir}/${e.name}`, ...folders(`${dir}/${e.name}`)] : [],
      )
    expect(folders('public').filter((f) => !register.includes(f))).toEqual([])
  })
})
