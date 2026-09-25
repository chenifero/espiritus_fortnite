import type { Sprite } from '../data/sprites'
import type { Collection } from './useCollection'
import images from '../data/spriteImages.json'
import catalog from '../data/spriteVariants.json'
import { variantsById, type VariantId } from '../data/variants'

const baseImages = images as Record<string, { file: string; kind: 'icon' | 'art' }>

type CatalogEntry = { catch: string; variants: Record<string, string> }
const catalogById = catalog as Record<string, CatalogEntry>

/** Orden fijo en el que se muestran las variantes, sea cual sea el espíritu. */
const ORDER: VariantId[] = [
  'base',
  'gold',
  'gummy',
  'galaxy',
  'holofoil',
  'cube',
  'quack',
  'gem',
  'cheat-master',
  'loot-hacker',
  'bounty-hunter',
]

/**
 * Variantes de un espíritu. Los lanzables del Cap. 6 y Cumpleaños no están en el
 * catálogo de spritecatch, así que cuentan solo como carta base.
 */
export function variantsFor(spriteId: string): VariantId[] {
  const entry = catalogById[spriteId]
  if (!entry) return ['base']
  const has = new Set(Object.keys(entry.variants))
  return ORDER.filter((v) => has.has(v))
}

export const cardId = (spriteId: string, variant: VariantId) => `${spriteId}:${variant}`

/**
 * Ruta del arte. La base sale del manifest, porque no todas son .png (las del
 * Cap. 6 vienen de la wiki en .webp); las variantes viven en su subcarpeta.
 */
export function cardImage(spriteId: string, variant: VariantId): string {
  const base = import.meta.env.BASE_URL
  if (variant !== 'base') return `${base}sprites/variants/${spriteId}-${variant}.png`
  const file = baseImages[spriteId]?.file ?? `${spriteId}.png`
  return `${base}sprites/${file}`
}

export function variantName(variant: VariantId): string {
  return variantsById[variant]?.name ?? variant
}

export type SpriteProgress = {
  /** Cartas que tienes, dominadas incluidas. */
  owned: number
  mastered: number
  total: number
  complete: boolean
  /** Todas sus cartas dominadas: el espíritu está exprimido del todo. */
  allMastered: boolean
  started: boolean
}

export function spriteProgress(spriteId: string, cards: Collection): SpriteProgress {
  const list = variantsFor(spriteId)
  const states = list.map((v) => cards[cardId(spriteId, v)])
  const owned = states.filter(Boolean).length
  const mastered = states.filter((s) => s === 'mastered').length
  return {
    owned,
    mastered,
    total: list.length,
    complete: owned === list.length,
    allMastered: mastered === list.length,
    started: owned > 0,
  }
}

export function totalCards(sprites: Sprite[]): number {
  return sprites.reduce((sum, s) => sum + variantsFor(s.id).length, 0)
}

export function ownedCards(sprites: Sprite[], cards: Collection): number {
  return sprites.reduce(
    (sum, s) => sum + variantsFor(s.id).filter((v) => cards[cardId(s.id, v)]).length,
    0,
  )
}

export function masteredCards(sprites: Sprite[], cards: Collection): number {
  return sprites.reduce(
    (sum, s) =>
      sum + variantsFor(s.id).filter((v) => cards[cardId(s.id, v)] === 'mastered').length,
    0,
  )
}
