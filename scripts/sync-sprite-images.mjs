// Reconstruye src/data/spriteImages.json a partir de lo que haya en public/sprites.
// Uso: npm run sprites:sync
//
// Pensado para cuando añades arte a mano: deja el archivo con el id del espíritu
// como nombre (p. ej. public/sprites/tails.png) y ejecuta esto.

import { readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIR = resolve(ROOT, 'public/sprites')
const MANIFEST = resolve(ROOT, 'src/data/spriteImages.json')
const SPRITES_TS = resolve(ROOT, 'src/data/sprites.ts')

const VALID = new Set(['.png', '.webp', '.jpg', '.jpeg', '.avif'])

async function spriteIds() {
  const src = (await readFile(SPRITES_TS, 'utf8')).split('export const sprites')[1] ?? ''
  return [...src.matchAll(/id: '([^']+)'/g)].map((m) => m[1])
}

async function main() {
  const ids = new Set(await spriteIds())
  const previous = JSON.parse(await readFile(MANIFEST, 'utf8').catch(() => '{}'))
  const files = await readdir(DIR)

  const manifest = {}
  const unknown = []
  const duplicates = []

  for (const file of files.sort()) {
    const ext = extname(file).toLowerCase()
    if (!VALID.has(ext)) continue

    const id = file.slice(0, -ext.length)
    if (!ids.has(id)) {
      unknown.push(file)
      continue
    }
    if (manifest[id]) {
      duplicates.push(`${id}: ${manifest[id].file} y ${file}`)
      continue
    }

    // Un JPEG no tiene transparencia, así que es ilustración, no icono recortado.
    // Se respeta el tipo anterior si ya estaba clasificado.
    const kind =
      previous[id]?.file === file
        ? previous[id].kind
        : ext === '.jpg' || ext === '.jpeg'
          ? 'art'
          : 'icon'

    manifest[id] = { file, kind }
  }

  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`)

  const missing = [...ids].filter((id) => !manifest[id])
  const promo = Object.entries(manifest).filter(([, v]) => v.kind === 'art')

  console.log(`Con arte: ${Object.keys(manifest).length}/${ids.size}`)
  if (promo.length) console.log(`Arte promocional: ${promo.map(([id]) => id).join(', ')}`)
  if (missing.length) console.log(`Sin arte (${missing.length}): ${missing.join(', ')}`)
  if (unknown.length) console.log(`\nIgnorados, el nombre no es un id válido:\n  ${unknown.join('\n  ')}`)
  if (duplicates.length) console.log(`\nDuplicados, se usó el primero:\n  ${duplicates.join('\n  ')}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
