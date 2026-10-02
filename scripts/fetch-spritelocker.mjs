// Descarga desde spritelocker.com el arte marcado como "spritelocker" en
// src/data/spriteVariants.json y lo convierte a PNG (allí se sirve en .webp).
//
//   node scripts/fetch-spritelocker.mjs
//
// Usa el slug `locker` de cada espíritu, o `catch` sin guiones si no lo tiene
// (spritelocker escribe los slugs pegados: crashbandicoot, stormscout...).
// Necesita ffmpeg en el PATH para la conversión.

import { execFile } from 'node:child_process'
import { mkdir, readFile, unlink } from 'node:fs/promises'
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

/** Nombre de cada variante en las URLs de spritelocker. */
const LOCKER_VARIANT = {
  base: 'basic',
  gold: 'gold',
  'cheat-master': 'cheatmaster',
  'loot-hacker': 'loothacker',
  'bounty-hunter': 'bountyhunter',
  'trick-or-treat': 'tricktreat',
}

/** Slugs de spritelocker que no salen de quitar los guiones al de spritecatch. */
const SLUG_FIXES = { '8-bit': 'eightbit' }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function lockerSlug({ catch: slug, locker }) {
  if (locker) return locker
  if (!slug) return null
  return SLUG_FIXES[slug] ?? slug.replaceAll('-', '')
}

async function download(url, dest) {
  const tmp = `${dest}.webp.part`
  const { stdout } = await execFileAsync('curl', [
    '-sL',
    '--max-time', '40',
    '-o', tmp,
    '-w', '%{http_code} %{content_type}',
    '-A', UA,
    url,
  ])
  const [code, type = ''] = stdout.trim().split(' ')
  try {
    if (code !== '200' || !type.startsWith('image/')) throw new Error(`HTTP ${code} ${type}`)
    await execFileAsync('ffmpeg', ['-y', '-loglevel', 'error', '-i', tmp, dest])
  } finally {
    await unlink(tmp).catch(() => {})
  }
}

async function main() {
  await mkdir(OUT_VARIANTS, { recursive: true })
  const catalog = JSON.parse(await readFile(CATALOG, 'utf8'))
  let ok = 0
  const failed = []

  for (const [id, entry] of Object.entries(catalog)) {
    const slug = lockerSlug(entry)
    for (const [variant, source] of Object.entries(entry.variants)) {
      if (source !== 'spritelocker') continue
      const url = `https://spritelocker.com/sprites/c7s4/${slug}_${LOCKER_VARIANT[variant]}.webp`
      const dest =
        variant === 'base'
          ? resolve(OUT, `${id}.png`)
          : resolve(OUT_VARIANTS, `${id}-${variant}.png`)
      try {
        await download(url, dest)
        ok++
        process.stdout.write(`  ✓ ${id}${variant === 'base' ? '' : ` · ${variant}`}\n`)
      } catch (err) {
        failed.push(`${id}/${variant}: ${err.message}`)
        process.stdout.write(`  ✗ ${id} · ${variant}: ${err.message}\n`)
      }
      await sleep(120)
    }
  }

  console.log(`\nDescargadas ${ok} imágenes`)
  if (failed.length) console.log(`Fallos:\n  ${failed.join('\n  ')}`)
  console.log('Ahora: npm run sprites:sync')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
