import type { SeasonId } from './sprites'

export type VariantId =
  | 'base'
  | 'gold'
  | 'gummy'
  | 'galaxy'
  | 'holofoil'
  | 'cube'
  | 'quack'
  | 'gem'
  | 'cheat-master'
  | 'loot-hacker'
  | 'bounty-hunter'

export type Variant = {
  id: VariantId
  name: string
  /** Qué añade sobre la habilidad del espíritu base, que siempre se conserva. */
  perk: string
  seasons: SeasonId[]
}

export const variants: Variant[] = [
  { id: 'base', name: 'Base', perk: 'Solo la habilidad normal.', seasons: ['c6', 'c7t3', 'c7t4'] },
  {
    id: 'gold',
    name: 'Oro',
    perk: 'Triple de XP por eliminaciones.',
    seasons: ['c7t3', 'c7t4'],
  },
  {
    id: 'gummy',
    name: 'Gominola',
    perk: '+20 % de polvo de espíritu al extraer.',
    seasons: ['c7t3'],
  },
  {
    id: 'galaxy',
    name: 'Galaxia',
    perk: '+30 % de munición al recogerla.',
    seasons: ['c7t3'],
  },
  {
    id: 'holofoil',
    name: 'Holográfico',
    perk: '5 % de probabilidad de que tu escuadra encuentre variantes raras en cofres.',
    seasons: ['c7t3'],
  },
  {
    id: 'cube',
    name: 'Cubo',
    perk: 'Efecto Impulso mientras estás en la tormenta.',
    seasons: ['c7t3'],
  },
  {
    id: 'quack',
    name: 'Quack',
    perk: 'Comparte el 50 % de la XP que gana con tus demás espíritus. Se consigue por maestría.',
    seasons: ['c7t3'],
  },
  {
    id: 'gem',
    name: 'Gema',
    perk: '−30 % de daño por caída.',
    seasons: ['c7t3'],
  },
  {
    id: 'cheat-master',
    name: 'Hacker',
    perk: 'Introduces los códigos de trucos sin fallar: cualquier combinación vale.',
    seasons: ['c7t4'],
  },
  {
    id: 'loot-hacker',
    name: 'Loot Hacker',
    perk: 'Más probabilidad de que tus Loot Hacks generen objetos (×1,2).',
    seasons: ['c7t4'],
  },
  {
    id: 'bounty-hunter',
    name: 'Cazarrecompensas',
    perk: 'Probabilidad de que salga un espíritu al eliminar; solo gana XP con eliminaciones.',
    seasons: ['c7t4'],
  },
]

export const variantsById = Object.fromEntries(variants.map((v) => [v.id, v])) as Record<
  VariantId,
  Variant
>
