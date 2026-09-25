// Resuelve el arte de cada espíritu en la Fortnite Wiki y lo descarga a public/sprites.
// Uso: node scripts/fetch-sprite-images.mjs
//
// La wiki responde 403 al CDN sin cabeceras de navegador, y varios nombres de archivo
// que circulan en las guías no existen, así que cada espíritu se resuelve por API:
// primero candidatos exactos, y si fallan, búsqueda en el namespace File.

import { execFile } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = resolve(ROOT, 'public/sprites')
const MANIFEST = resolve(ROOT, 'src/data/spriteImages.json')
const API = 'https://fortnite.fandom.com/api.php'

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

const browserHeaders = {
  'User-Agent': UA,
  Referer: 'https://fortnite.fandom.com/',
  'Accept-Language': 'en-US,en;q=0.9',
}

/** id del espíritu -> nombre(s) base con los que la wiki titula su archivo. */
const WIKI_NAMES = {
  'agua-c6': ['Water'],
  'aire-c6': ['Air'],
  'tierra-c6': ['Earth'],
  'impulso-c6': ['Dash'],
  'superman-c6': ['Superman'],

  agua: ['Water'],
  tierra: ['Earth'],
  fuego: ['Fire'],
  pez: ['Fishy', 'Fish'],
  aire: ['Air'],
  pato: ['Duck'],
  fantasma: ['Ghost'],
  demoniaco: ['Demon', 'Demonic'],
  rey: ['King'],
  striker: ['Striker'],
  aura: ['Aura'],
  sonador: ['Dream', 'Dreamer'],
  punk: ['Punk'],
  jefe: ['Boss'],
  seven: ['Seven'],
  'llama-saqueadora': ["Lootin' Llama", 'Lootin Llama', 'Loot Llama'],
  'peeky-peely': ['Peeky Peely', 'Peely'],
  'john-wick': ['John Wick'],
  batman: ['Batman'],
  'burnt-peanut': ['Burnt Peanut'],
  'vini-jr': ['Vini Jr.', 'Vini Jr'],
  'punto-cero': ['Zero Point'],
  parca: ['Grim', 'Grim Reaper', 'Reaper'],
  pollo: ['Pollo'],
  ironmouse: ['Ironmouse'],

  jonesy: ['Jonesy'],
  arbustin: ['Bush'],
  aventurero: ['Adventure', 'Adventurer'],
  '8-bits': ['8-Bit', '8-Bits', '8 Bit'],
  exploratormentas: ['Storm Scout', 'Storm'],
  onigiri: ['Onigiri'],
  protector: ['Overshield'],
  'mega-man': ['Mega Man', 'Megaman'],
  killswitch: ['Killswitch'],
  tails: ['Tails'],
  shadow: ['Shadow'],
  sonic: ['Sonic'],
  'crash-bandicoot': ['Crash Bandicoot', 'Crash'],
  blinky: ['Blinky'],
  morgana: ['Morgana'],
  estanque: ['Pond', 'Puddle'],
  cumpleanos: ['Birthday'],
  'jazz-jackrabbit': ['Jackrabbit', 'Jazz Jackrabbit', 'Jazz'],
  'rayos-x': ['X-Ray', 'XRay'],
  klombo: ['Klombo'],
  'corona-victoria': ['Crown', 'Victory Crown'],
}

/**
 * Espíritus del Cap. 7 T4 que la wiki aún no tiene como icono de item.
 * URLs comprobadas en las guías de GamerFocus citadas en espiritus-fortnite.md.
 */
const DIRECT_URLS = {
  exploratormentas: 'https://www.gamerfocus.co/wp-content/uploads/2026/08/image-65.png',
  'crash-bandicoot': 'https://www.gamerfocus.co/wp-content/uploads/2026/09/espiritu-de-crash.png',
  blinky: 'https://www.gamerfocus.co/wp-content/uploads/2026/09/espiritu-de-blinky.png',
  morgana: 'https://www.gamerfocus.co/wp-content/uploads/2026/09/espiritu-de-morgana.png',
  estanque: 'https://www.gamerfocus.co/wp-content/uploads/2026/09/espiritu-del-charco.png',
  cumpleanos: 'https://www.gamerfocus.co/wp-content/uploads/2026/09/espiritu-de-cumpleanos.png',
}

/**
 * Patrones de título usados por la wiki para el arte de items/personajes.
 * Ojo: sin "Sprite" el título choca con el objeto normal del juego (el arbusto,
 * la corona…) en vez del espíritu, así que todos los patrones lo exigen.
 */
const PATTERNS = [
  (n) => `${n} Sprite - Item - Fortnite.png`,
  (n) => `${n} Sprite - Character - Fortnite.png`,
  (n) => `${n} Sprite - Outfit - Fortnite.png`,
  (n) => `${n} Sprite - Item - Fortnite.jpg`,
]

/** Excepciones verificadas a ojo que no siguen el patrón. */
const EXACT_TITLES = {
  'burnt-peanut': 'Burnt Peanut - Item - Fortnite.png',
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function api(params) {
  const url = `${API}?${new URLSearchParams({ ...params, format: 'json' })}`
  const res = await fetch(url, { headers: browserHeaders })
  if (!res.ok) throw new Error(`API ${res.status} ${url}`)
  return res.json()
}

/** Comprueba en lotes qué títulos File: existen y devuelve título -> url del CDN. */
async function resolveTitles(titles) {
  const found = new Map()
  for (let i = 0; i < titles.length; i += 40) {
    const batch = titles.slice(i, i + 40)
    const data = await api({
      action: 'query',
      titles: batch.map((t) => `File:${t}`).join('|'),
      prop: 'imageinfo',
      iiprop: 'url',
    })
    for (const page of Object.values(data?.query?.pages ?? {})) {
      const url = page?.imageinfo?.[0]?.url
      if (url) found.set(page.title.replace(/^File:/, ''), url)
    }
    await sleep(250)
  }
  return found
}

/** Tipos de arte aceptables, de mejor a peor. Mechanic son diagramas y Spray no es el icono. */
const ART_KINDS = ['Item', 'Character', 'Outfit', 'Promo', 'Concept Art']

const normalize = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '')

/**
 * Último recurso: busca en el namespace File. Exige que el nombre del espíritu
 * aparezca en el título, para no colar el arte de otro espíritu.
 */
async function searchFile(name) {
  const data = await api({
    action: 'query',
    list: 'search',
    srsearch: `${name} Sprite`,
    srnamespace: '6',
    srlimit: '20',
  })
  const wanted = normalize(name)
  const hits = (data?.query?.search ?? [])
    .map((h) => h.title.replace(/^File:/, ''))
    .filter((t) => /\.(png|jpg|jpeg|webp)$/i.test(t))
    .filter((t) => /sprite/i.test(t))
    .filter((t) => normalize(t.split(' Sprite')[0]) === wanted)
    .filter((t) => ART_KINDS.some((k) => t.includes(`- ${k} -`)))

  return hits.sort((a, b) => {
    const rank = (t) => ART_KINDS.findIndex((k) => t.includes(`- ${k} -`))
    return rank(a) - rank(b)
  })
}

/**
 * El CDN de Wikia responde 403 a Node fetch (fingerprint TLS) pero sirve la imagen a curl
 * con cabeceras de navegador, así que la descarga se delega a curl.
 */
async function download(url, dest) {
  const tmp = resolve(OUT_DIR, `.${dest}.part`)
  const { stdout } = await execFileAsync('curl', [
    '-sL',
    '--max-time', '30',
    '-o', tmp,
    '-w', '%{http_code} %{content_type}',
    '-A', UA,
    '-H', 'Referer: https://fortnite.fandom.com/',
    '-H', 'Accept: image/webp,image/png,image/*,*/*;q=0.8',
    '-H', 'Accept-Language: en-US,en;q=0.9',
    '-H', 'Sec-Fetch-Dest: image',
    '-H', 'Sec-Fetch-Mode: no-cors',
    '-H', 'Sec-Fetch-Site: cross-site',
    url,
  ])

  const [code, type = ''] = stdout.trim().split(' ')
  if (code !== '200') throw new Error(`HTTP ${code}`)
  if (!type.startsWith('image/')) throw new Error(`no es imagen (${type})`)

  const buf = await readFile(tmp)
  const ext = type.includes('webp') ? 'webp' : type.includes('jpeg') ? 'jpg' : 'png'
  const file = `${dest}.${ext}`
  await writeFile(resolve(OUT_DIR, file), buf)
  await execFileAsync('rm', ['-f', tmp]).catch(() => {})
  return { file, bytes: buf.length }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  const ids = Object.keys(WIKI_NAMES)

  // 1) Todos los candidatos de todos los espíritus, en una sola tanda de lotes.
  const candidates = new Map() // título -> [ids]
  for (const title of Object.values(EXACT_TITLES)) candidates.set(title, [])
  for (const id of ids) {
    for (const name of WIKI_NAMES[id]) {
      for (const pattern of PATTERNS) {
        const title = pattern(name)
        if (!candidates.has(title)) candidates.set(title, [])
        candidates.get(title).push(id)
      }
    }
  }

  console.log(`Comprobando ${candidates.size} candidatos en la wiki…`)
  const existing = await resolveTitles([...candidates.keys()])
  console.log(`  ${existing.size} archivos existen.\n`)

  // 2) Primer candidato válido por espíritu, en el orden de preferencia declarado.
  const resolved = new Map() // id -> { title, url, kind }
  for (const [id, title] of Object.entries(EXACT_TITLES)) {
    if (existing.has(title)) resolved.set(id, { title, url: existing.get(title), kind: 'icon' })
  }
  for (const id of ids) {
    if (resolved.has(id)) continue
    outer: for (const name of WIKI_NAMES[id]) {
      for (const pattern of PATTERNS) {
        const title = pattern(name)
        if (existing.has(title)) {
          resolved.set(id, { title, url: existing.get(title), kind: 'icon' })
          break outer
        }
      }
    }
  }

  // 3) URLs directas para los que la wiki no cataloga como icono.
  for (const [id, url] of Object.entries(DIRECT_URLS)) {
    if (!resolved.has(id)) resolved.set(id, { title: url.split('/').pop(), url, kind: 'icon' })
  }

  // 4) Búsqueda para los que no encajaron con ningún patrón.
  const missing = ids.filter((id) => !resolved.has(id))
  if (missing.length) {
    console.log(`Buscando ${missing.length} sin coincidencia exacta…`)
    for (const id of missing) {
      const hits = await searchFile(WIKI_NAMES[id][0])
      if (hits.length) {
        const urls = await resolveTitles([hits[0]])
        const url = urls.get(hits[0])
        if (url) {
          // Promo y concept art son ilustraciones sin transparencia, no el icono del item.
          const kind = hits[0].includes('- Item -') ? 'icon' : 'art'
          resolved.set(id, { title: hits[0], url, kind, viaSearch: true })
          console.log(`  ${id} -> ${hits[0]} (búsqueda)`)
        }
      } else {
        console.log(`  ${id} -> sin resultados`)
      }
      await sleep(300)
    }
    console.log('')
  }

  // 5) Descarga.
  const manifest = {}
  const failed = []
  console.log(`Descargando ${resolved.size} imágenes…`)
  for (const [id, { title, url, kind, viaSearch }] of resolved) {
    try {
      const { file, bytes } = await download(url, id)
      manifest[id] = { file, kind }
      console.log(`  ✓ ${id.padEnd(18)} ${(bytes / 1024).toFixed(0).padStart(4)} KB  ${kind === 'art' ? '[art] ' : ''}${title}${viaSearch ? '  (búsqueda)' : ''}`)
    } catch (err) {
      failed.push(id)
      console.log(`  ✗ ${id}: ${err.message}`)
    }
    await sleep(150)
  }

  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`)

  const noArt = ids.filter((id) => !manifest[id])
  console.log(`\nResuelto: ${Object.keys(manifest).length}/${ids.length}`)
  if (noArt.length) console.log(`Sin arte: ${noArt.join(', ')}`)
  if (failed.length) console.log(`Fallos de descarga: ${failed.join(', ')}`)
  console.log(`Manifest -> ${MANIFEST}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
