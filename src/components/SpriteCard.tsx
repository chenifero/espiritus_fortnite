import { Check } from 'lucide-react'
import type { CSSProperties } from 'react'
import type { Sprite } from '../data/sprites'
import { cardId, cardImage, spriteProgress, variantsFor } from '../lib/cards'
import { rarityColor, spriteTag } from '../lib/rarity'
import type { Collection } from '../lib/useCollection'
import { CrownBadge } from './CrownBadge'

type Props = {
  sprite: Sprite
  cards: Collection
  onOpen: () => void
}

export function SpriteCard({ sprite, cards, onOpen }: Props) {
  const color = rarityColor(sprite.rarity)
  const list = variantsFor(sprite.id)
  const { owned: have, total, complete, allMastered, started } = spriteProgress(sprite.id, cards)

  const label = allMastered
    ? `${sprite.name}. Dominado al completo.`
    : `${sprite.name}. ${have} de ${total} cartas.`

  // La corona sobresale del marco, así que el recorte vive en el botón y no aquí.
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`${label} Abrir para marcar.`}
        className={[
          'group relative block w-full overflow-hidden rounded-2xl border text-left',
          'transition-[transform,border-color,box-shadow] duration-200 ease-[var(--ease-out-strong)]',
          'active:scale-[0.97]',
          complete ? 'holo bg-slab' : started ? 'bg-slab' : 'bg-pit',
        ].join(' ')}
        style={
          {
            '--rarity': allMastered ? '#ffc42e' : color,
            borderColor: allMastered
              ? '#ffc42e'
              : complete
                ? color
                : started
                  ? 'var(--color-edge-lit)'
                  : 'var(--color-edge)',
            boxShadow: allMastered
              ? '0 12px 34px -12px rgba(255, 180, 20, 0.6)'
              : complete
                ? `0 10px 30px -12px color-mix(in oklab, ${color} 55%, transparent)`
                : '0 8px 24px -18px #000',
          } as CSSProperties
        }
      >
        <div className="relative aspect-square w-full overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: allMastered
                ? 'radial-gradient(120% 90% at 50% 8%, rgba(255, 196, 46, 0.3), transparent 72%)'
                : started
                  ? `radial-gradient(120% 90% at 50% 8%, color-mix(in oklab, ${color} 26%, transparent), transparent 72%)`
                  : 'radial-gradient(120% 90% at 50% 8%, rgba(255,255,255,0.035), transparent 72%)',
            }}
          />
          <img
            src={cardImage(sprite.id, 'base')}
            alt=""
            loading="lazy"
            decoding="async"
            className={[
              'relative h-full w-full scale-95 object-contain p-2',
              'transition-[filter,opacity] duration-300 ease-[var(--ease-out-strong)]',
              started ? 'opacity-100' : 'opacity-45 brightness-[0.55] grayscale contrast-125',
            ].join(' ')}
          />
        </div>

        <div className="relative border-t border-edge/80 px-3 pb-2.5 pt-2.5">
          <h3
            className={[
              'font-display text-[0.95rem] font-extrabold leading-tight',
              started ? 'text-chalk' : 'text-ash',
            ].join(' ')}
            style={{ fontStretch: '112%', letterSpacing: '-0.015em' }}
          >
            {sprite.name}
          </h3>

          <div className="mt-1.5 flex items-center justify-between gap-2">
            <span
              className="inline-flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-wide"
              style={{ color: started ? color : 'var(--color-dust)' }}
            >
              <span
                className="h-1.5 w-1.5 rotate-45 rounded-[2px]"
                style={{ background: started ? color : 'var(--color-dust)' }}
              />
              {spriteTag(sprite)}
            </span>

            {total > 1 && (
              <span
                className="tabular text-[0.7rem] font-semibold"
                style={{ color: allMastered ? '#ffc42e' : complete ? color : 'var(--color-dust)' }}
              >
                {have}/{total}
              </span>
            )}
          </div>

          {total > 1 && (
            <div className="mt-2 flex gap-1" aria-hidden="true">
              {list.map((v) => {
                const state = cards[cardId(sprite.id, v)]
                return (
                  <span
                    key={v}
                    className="h-1 flex-1 rounded-full transition-colors duration-200"
                    style={{
                      background:
                        state === 'mastered'
                          ? '#ffc42e'
                          : state
                            ? color
                            : 'var(--color-edge-lit)',
                    }}
                  />
                )
              })}
            </div>
          )}
        </div>

        {!allMastered && (
          <span
            className="absolute right-2.5 top-2.5 grid h-7 min-w-7 place-items-center rounded-full border px-1.5 transition-[background-color,border-color] duration-200"
            style={{
              borderColor: complete ? color : 'var(--color-edge-lit)',
              background: complete
                ? color
                : 'color-mix(in oklab, var(--color-void) 72%, transparent)',
            }}
          >
            {complete ? (
              <Check size={15} strokeWidth={3.5} className="text-void" />
            ) : started ? (
              <span className="tabular text-[0.7rem] font-bold" style={{ color }}>
                {have}
              </span>
            ) : null}
          </span>
        )}
      </button>

      {allMastered && <CrownBadge className="absolute -right-2 -top-2.5 z-10" size={32} />}
    </div>
  )
}
