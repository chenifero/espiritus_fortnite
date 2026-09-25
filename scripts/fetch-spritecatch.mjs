// Descarga el arte desde spritecatch.com usando src/data/spriteVariants.json.
//
//   node scripts/fetch-spritecatch.mjs              solo la carta base de cada espíritu
//   node scripts/fetch-spritecatch.mjs --variants   además todas las variantes
//
// Las bases van a public/sprites/<id>.png y las variantes a
// public/sprites/variants/<id>-<variante>.png.

import { execFile } from 'node:child_process'
import { mkdir, readdir, readFile, rename, unlink } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'public/sprites')
const OUT_VARIANTS = resolve(OUT, 'variants')
const CATALOG = resolve(ROOT, 'src/data/spriteVariants.json')

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

const withVariants = process.argv.includes('--variants')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function download(url, dest) {
  const tmp = `${dest}.part`
  const { stdout } = await execFileAsync('curl', [
    '-sL',
    '--max-time', '40',
    '-o', tmp,
    '-w', '%{http_code} %{content_type} %{size_download}',
    '-A', UA,
    '-H', 'Referer: https://spritecatch.com/',
    '-H', 'Accept: image/png,image/*,*/*;q=0.8',
    url,
  ])
  const [code, type = '', size = '0'] = stdout.trim().split(' ')
  if (code !== '200' || !type.startsWith('image/')) {
    await unlink(tmp).catch(() => {})
    throw new Error(`HTTP ${code} ${type}`)
  }
  await rename(tmp, dest)
  return Number(size)
}

/** Evita que queden dos archivos del mismo espíritu con distinta extensión. */
async function removeExisting(id) {
  const files = await readdir(OUT)
  for (const f of files) {
    if (f.replace(/\.[^.]+$/, '') === id && f !== `${id}.png`) {
      await unlink(resolve(OUT, f))
    }
  }
}

async function main() {
  await mkdir(OUT, { recursive: true })
  if (withVariants) await mkdir(OUT_VARIANTS, { recursive: true })

  const catalog = JSON.parse(await readFile(CATALOG, 'utf8'))
  let ok = 0
  let bytes = 0
  const failed = []

  for (const [id, { catch: slug, variants }] of Object.entries(catalog)) {
    const wanted = withVariants ? Object.entries(variants) : [['base', variants.base]]

    for (const [variant, hash] of wanted) {
      const url = `https://img.spritecatch.com/sprites/${slug}/${variant}-${hash}.png`
      const dest =
        variant === 'base'
          ? resolve(OUT, `${id}.png`)
          : resolve(OUT_VARIANTS, `${id}-${variant}.png`)

      try {
        const size = await download(url, dest)
        if (variant === 'base') await removeExisting(id)
        ok++
        bytes += size
        process.stdout.write(`  ✓ ${id}${variant === 'base' ? '' : ` · ${variant}`}\n`)
      } catch (err) {
        failed.push(`${id}/${variant}: ${err.message}`)
        process.stdout.write(`  ✗ ${id} · ${variant}: ${err.message}\n`)
      }
      await sleep(120)
    }
  }

  console.log(`\nDescargadas ${ok} imágenes (${(bytes / 1024 / 1024).toFixed(1)} MB)`)
  if (failed.length) console.log(`Fallos:\n  ${failed.join('\n  ')}`)
  console.log('Ahora: npm run sprites:sync')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
