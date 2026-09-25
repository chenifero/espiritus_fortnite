import { Check, X } from 'lucide-react'
import { useEffect, type CSSProperties } from 'react'
import { seasons, type Sprite } from '../data/sprites'
import { variantsById, type VariantId } from '../data/variants'
import { cardId, cardImage, spriteProgress, variantsFor } from '../lib/cards'
import { rarityColor, spriteTag } from '../lib/rarity'
import type { CardState, Collection } from '../lib/useCollection'
import { CrownBadge } from './CrownBadge'

const GOLD = '#ffc42e'

type Props = {
  sprite: Sprite
  cards: Collection
  onCycle: (card: string) => void
  onSetMany: (list: string[], state: CardState | null) => void
  onClose: () => void
}

export function SpriteSheet({ sprite, cards, onCycle, onSetMany, onClose }: Props) {
  const color = rarityColor(sprite.rarity)
  const season = seasons.find((s) => s.id === sprite.season)
  const list = variantsFor(sprite.id)
  const { owned: have, total, complete, mastered } = spriteProgress(sprite.id, cards)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const allCards = list.map((v) => cardId(sprite.id, v))

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-void/80 backdrop-blur-sm"
        style={{ animation: 'sheet-fade 200ms var(--ease-out-strong)' }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={sprite.name}
        className="relative w-full max-w-lg overflow-y-auto rounded-t-3xl border border-edge bg-pit sm:rounded-3xl"
        style={
          {
            '--rarity': color,
            maxHeight: '90dvh',
            overscrollBehavior: 'contain',
            paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))',
            animation: 'sheet-rise 280ms var(--ease-out-strong)',
          } as CSSProperties
        }
      >
        <div className="sticky top-0 z-10 flex justify-center bg-pit/90 pb-1 pt-3 backdrop-blur sm:hidden">
          <span className="h-1 w-9 rounded-full bg-edge-lit" />
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full border border-edge bg-void/70 text-ash transition-colors hover:text-chalk active:scale-95"
        >
          <X size={16} strokeWidth={2.5} />
        </button>

        <div className="relative aspect-[5/3] w-full overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(85% 100% at 50% 0%, color-mix(in oklab, ${color} 30%, transparent), transparent 70%)`,
            }}
          />
          <img
            src={cardImage(sprite.id, 'base')}
            alt={sprite.name}
            className="relative h-full w-full object-contain p-5"
          />
        </div>

        <div className="px-5 pt-4">
          <h2
            className="font-display text-2xl font-black leading-tight"
            style={{ fontStretch: '115%', letterSpacing: '-0.025em' }}
          >
            {sprite.name}
          </h2>
          {sprite.nameEn && sprite.nameEn !== sprite.name && (
            <p className="mt-0.5 text-[0.85rem] text-dust">{sprite.nameEn}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-2.5 py-1 text-[0.72rem] font-bold uppercase tracking-wide"
              style={{ color, background: `color-mix(in oklab, ${color} 15%, transparent)` }}
            >
              {spriteTag(sprite)}
            </span>
            <span className="rounded-full border border-edge px-2.5 py-1 text-[0.72rem] font-semibold text-ash">
              {season?.shortName}
            </span>
          </div>

          <p className="mt-4 text-[0.95rem] leading-relaxed text-ash">{sprite.ability}</p>

          <div className="mt-6 flex items-baseline justify-between gap-3">
            <h3
              className="font-display text-[0.95rem] font-extrabold uppercase tracking-wide"
              style={{ fontStretch: '112%' }}
            >
              {total > 1 ? 'Variantes' : 'Carta'}{' '}
              <span
                className="tabular font-bold"
                style={{ color: complete ? color : 'var(--color-dust)' }}
              >
                {have}/{total}
              </span>
              {mastered > 0 && (
                <span className="tabular ml-2 font-bold" style={{ color: GOLD }}>
                  {mastered} dominada{mastered === 1 ? '' : 's'}
                </span>
              )}
            </h3>
            {total > 1 && (
              <button
                type="button"
                onClick={() => onSetMany(allCards, complete ? null : 'owned')}
                className="rounded-lg border border-edge px-2.5 py-1.5 text-[0.75rem] font-semibold text-ash transition-colors hover:border-edge-lit hover:text-chalk active:scale-[0.97]"
              >
                {complete ? 'Quitar todas' : 'Marcar todas'}
              </button>
            )}
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {list.map((variant) => (
              <VariantTile
                key={variant}
                spriteId={sprite.id}
                variant={variant}
                color={color}
                state={cards[cardId(sprite.id, variant)]}
                onCycle={() => onCycle(cardId(sprite.id, variant))}
              />
            ))}
          </div>

          {total > 1 && (
            <dl className="mt-5 space-y-2 border-t border-edge pt-4">
              {list.map((variant) => (
                <div key={variant} className="text-[0.78rem] leading-snug">
                  <dt className="inline font-semibold" style={{ color }}>
                    {variantsById[variant].name}.{' '}
                  </dt>
                  <dd className="inline text-dust">{variantsById[variant].perk}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>

      <style>{`
        @keyframes sheet-rise {
          from { transform: translateY(12px) scale(0.98); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes sheet-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          [role="dialog"] { animation: none !important; }
        }
      `}</style>
    </div>
  )
}

function VariantTile({
  spriteId,
  variant,
  color,
  state,
  onCycle,
}: {
  spriteId: string
  variant: VariantId
  color: string
  state: CardState | undefined
  onCycle: () => void
}) {
  const owned = Boolean(state)
  const mastered = state === 'mastered'
  const accent = mastered ? GOLD : color

  const status = mastered ? 'Dominada' : owned ? 'La tienes' : 'Te falta'
  const next = mastered ? 'quitarla' : owned ? 'marcarla como dominada' : 'añadirla'

  // El envoltorio no recorta para que la corona pueda salirse del marco.
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onCycle}
        aria-pressed={owned}
        aria-label={`${variantsById[variant].name}. ${status}. Pulsa para ${next}.`}
        className={[
          'relative w-full overflow-hidden rounded-xl border p-1.5',
          'transition-[transform,border-color,background-color,box-shadow] duration-200 ease-[var(--ease-out-strong)]',
          'active:scale-[0.96]',
          owned ? 'holo' : '',
        ].join(' ')}
        style={
          {
            '--rarity': accent,
            borderColor: owned ? accent : 'var(--color-edge)',
            background: owned
              ? `color-mix(in oklab, ${accent} 12%, var(--color-slab))`
              : 'var(--color-void)',
            boxShadow: mastered ? '0 6px 18px -6px rgba(255, 180, 20, 0.55)' : undefined,
          } as CSSProperties
        }
      >
        <div className="relative aspect-square w-full">
          <img
            src={cardImage(spriteId, variant)}
            alt=""
            loading="lazy"
            decoding="async"
            onError={(e) => {
              // El arte de variantes puede no estar descargado todavía.
              e.currentTarget.src = cardImage(spriteId, 'base')
            }}
            className={[
              'h-full w-full object-contain transition-[filter,opacity] duration-200',
              // Sin desaturar: el color es lo que diferencia una variante de otra.
              owned ? 'opacity-100' : 'opacity-60 brightness-75',
            ].join(' ')}
          />
          {owned && !mastered && (
            <span
              className="absolute right-0 top-0 grid h-4 w-4 place-items-center rounded-full"
              style={{ background: color }}
            >
              <Check size={10} strokeWidth={4} className="text-void" />
            </span>
          )}
        </div>
        <p
          className="relative mt-1 truncate text-center text-[0.68rem] font-semibold"
          style={{ color: owned ? accent : 'var(--color-dust)' }}
        >
          {variantsById[variant].name}
        </p>
      </button>

      {mastered && <CrownBadge className="absolute -right-1.5 -top-2 z-10" size={22} />}
    </div>
  )
}
