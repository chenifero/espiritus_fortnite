import { Crown } from 'lucide-react'
import { seasons, type Sprite } from '../data/sprites'
import { masteredCards, ownedCards, spriteProgress, totalCards } from '../lib/cards'
import type { Collection } from '../lib/useCollection'

type Props = {
  sprites: Sprite[]
  collection: Collection
}

export function ProgressHeader({ sprites, collection }: Props) {
  const cards = totalCards(sprites)
  const have = ownedCards(sprites, collection)
  const mastered = masteredCards(sprites, collection)
  const pct = cards === 0 ? 0 : Math.round((have / cards) * 100)
  const complete = sprites.filter((s) => spriteProgress(s.id, collection).complete).length

  return (
    <header
      className="border-b border-edge bg-void/85 backdrop-blur-xl"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="mx-auto max-w-5xl px-4 pb-4 pt-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1
              className="font-display text-2xl font-black leading-none sm:text-3xl"
              style={{ fontStretch: '118%', letterSpacing: '-0.03em' }}
            >
              Espíritus
            </h1>
            <p className="mt-1.5 text-[0.8rem] text-ash">
              <span className="tabular font-semibold text-chalk">{complete}</span> de{' '}
              <span className="tabular">{sprites.length}</span> espíritus al completo
            </p>
          </div>

          <div className="text-right">
            <p className="tabular font-display text-2xl font-black leading-none sm:text-3xl">
              <span style={{ color: have === cards ? 'var(--color-mitico)' : undefined }}>
                {have}
              </span>
              <span className="text-dust">/{cards}</span>
            </p>
            <p className="tabular mt-1.5 flex items-center justify-end gap-2 text-[0.8rem] text-ash">
              {mastered > 0 && (
                <span
                  className="inline-flex items-center gap-1 font-semibold"
                  style={{ color: '#ffc42e' }}
                >
                  <Crown size={12} strokeWidth={2.5} fill="currentColor" fillOpacity={0.25} />
                  {mastered}
                </span>
              )}
              {pct} % de cartas
            </p>
          </div>
        </div>

        <div className="mt-3.5 h-1.5 overflow-hidden rounded-full bg-edge">
          <div
            className="h-full rounded-full transition-[width] duration-500 ease-[var(--ease-out-strong)]"
            style={{
              width: `${pct}%`,
              background:
                'linear-gradient(90deg, var(--color-raro), var(--color-epico) 45%, var(--color-legendario) 75%, var(--color-mitico))',
            }}
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          {seasons.map((season) => {
            const group = sprites.filter((s) => s.season === season.id)
            if (group.length === 0) return null
            const got = ownedCards(group, collection)
            const tot = totalCards(group)
            return (
              <p key={season.id} className="text-[0.75rem] text-dust">
                {season.shortName}{' '}
                <span
                  className="tabular font-semibold"
                  style={{ color: got === tot ? 'var(--color-mitico)' : 'var(--color-ash)' }}
                >
                  {got}/{tot}
                </span>
              </p>
            )
          })}
        </div>
      </div>
    </header>
  )
}
