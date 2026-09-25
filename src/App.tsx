import { SearchX } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Filters, type FilterState } from './components/Filters'
import { ProgressHeader } from './components/ProgressHeader'
import { SpriteCard } from './components/SpriteCard'
import { SpriteSheet } from './components/SpriteSheet'
import { seasons, sprites } from './data/sprites'
import { spriteProgress } from './lib/cards'
import { useCollection } from './lib/useCollection'

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

export default function App() {
  const { cards, cycle, setMany } = useCollection()
  const [openId, setOpenId] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    query: '',
    season: 'todas',
    rarity: 'todas',
    ownedFilter: 'todos',
  })

  const visible = useMemo(() => {
    const q = normalize(filters.query.trim())
    return sprites.filter((s) => {
      if (filters.season !== 'todas' && s.season !== filters.season) return false
      if (filters.rarity !== 'todas' && s.rarity !== filters.rarity) return false
      if (filters.ownedFilter !== 'todos') {
        const { complete } = spriteProgress(s.id, cards)
        if (filters.ownedFilter === 'completos' && !complete) return false
        if (filters.ownedFilter === 'faltan' && complete) return false
      }
      if (q && !normalize(`${s.name} ${s.nameEn ?? ''}`).includes(q)) return false
      return true
    })
  }, [filters, cards])

  const grouped = useMemo(
    () =>
      seasons
        .map((season) => ({
          season,
          items: visible.filter((s) => s.season === season.id),
        }))
        .filter((g) => g.items.length > 0),
    [visible],
  )

  const open = openId ? sprites.find((s) => s.id === openId) : undefined

  return (
    <div className="min-h-dvh">
      <div className="sticky top-0 z-40">
        <ProgressHeader sprites={sprites} collection={cards} />
        <div className="border-b border-edge bg-void/85 backdrop-blur-xl">
          <Filters value={filters} onChange={setFilters} />
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 pb-12 pt-5">
        {grouped.length === 0 ? (
          <EmptyState
            onReset={() =>
              setFilters({ query: '', season: 'todas', rarity: 'todas', ownedFilter: 'todos' })
            }
          />
        ) : (
          grouped.map(({ season, items }) => (
            <section key={season.id} className="mb-9">
              <div className="mb-3">
                <h2
                  className="font-display text-[0.95rem] font-extrabold uppercase tracking-wide text-ash"
                  style={{ fontStretch: '112%' }}
                >
                  {season.name}
                </h2>
                <p className="mt-0.5 max-w-prose text-[0.8rem] leading-snug text-dust">
                  {season.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {items.map((sprite) => (
                  <SpriteCard
                    key={sprite.id}
                    sprite={sprite}
                    cards={cards}
                    onOpen={() => setOpenId(sprite.id)}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      <footer
        className="border-t border-edge"
        style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <p className="mx-auto max-w-5xl px-4 pt-6 text-center text-[0.8rem] text-dust">
          Realizado por{' '}
          <a
            href="https://iamsergio.dev/"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-ash underline decoration-edge-lit underline-offset-4 transition-colors hover:text-chalk hover:decoration-ash"
          >
            iamsergio.dev
          </a>
        </p>
      </footer>

      {open && (
        <SpriteSheet
          sprite={open}
          cards={cards}
          onCycle={cycle}
          onSetMany={setMany}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  )
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <SearchX size={28} strokeWidth={2} className="text-dust" />
      <p className="mt-4 font-display text-lg font-extrabold">Ningún espíritu encaja</p>
      <p className="mt-1.5 max-w-xs text-[0.88rem] leading-snug text-ash">
        Prueba a quitar algún filtro o a buscar otro nombre.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-5 rounded-xl border border-edge-lit px-4 py-2.5 text-[0.85rem] font-semibold transition-colors hover:border-ash active:scale-[0.97]"
      >
        Quitar filtros
      </button>
    </div>
  )
}
