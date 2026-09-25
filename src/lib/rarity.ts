import type { Rarity, Sprite } from '../data/sprites'

/** Color de cada rareza. null = rareza aún no confirmada oficialmente. */
export function rarityColor(rarity: Rarity | null): string {
  switch (rarity) {
    case 'raro':
      return 'var(--color-raro)'
    case 'epico':
      return 'var(--color-epico)'
    case 'legendario':
      return 'var(--color-legendario)'
    case 'mitico':
      return 'var(--color-mitico)'
    default:
      return 'var(--color-incognita)'
  }
}

export function rarityLabel(rarity: Rarity | null): string {
  switch (rarity) {
    case 'raro':
      return 'Raro'
    case 'epico':
      return 'Épico'
    case 'legendario':
      return 'Legendario'
    case 'mitico':
      return 'Mítico'
    default:
      return 'Sin confirmar'
  }
}

/**
 * Etiqueta de la carta. Los lanzables del Cap. 6 no tenían rareza como concepto,
 * así que anunciarlos como «sin confirmar» sería ruido.
 */
export function spriteTag(sprite: Sprite): string {
  if (sprite.kind === 'lanzable') return 'Lanzable'
  return rarityLabel(sprite.rarity)
}
