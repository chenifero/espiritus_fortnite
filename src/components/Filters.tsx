import { Search, X } from 'lucide-react'
import { seasons, type Rarity, type SeasonId } from '../data/sprites'
import { rarityColor, rarityLabel } from '../lib/rarity'

export type OwnedFilter = 'todos' | 'completos' | 'faltan'

export type FilterState = {
  query: string
  season: SeasonId | 'todas'
  rarity: Rarity | 'todas'
  ownedFilter: OwnedFilter
}

const rarities: Rarity[] = ['raro', 'epico', 'legendario', 'mitico']

const ownedOptions: { value: OwnedFilter; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'completos', label: 'Completos' },
  { value: 'faltan', label: 'Me faltan' },
]

type Props = {
  value: FilterState
  onChange: (next: FilterState) => void
}

export function Filters({ value, onChange }: Props) {
  const set = <K extends keyof FilterState>(key: K, v: FilterState[K]) =>
    onChange({ ...value, [key]: v })

  return (
    <div className="mx-auto max-w-5xl px-4 pb-3 pt-4">
      <div className="relative">
        <Search
          size={16}
          strokeWidth={2.5}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-dust"
        />
        <input
          type="search"
          value={value.query}
          onChange={(e) => set('query', e.target.value)}
          placeholder="Buscar espíritu…"
          enterKeyHint="search"
          autoCapitalize="none"
          autoCorrect="off"
          className="w-full rounded-xl border border-edge bg-pit py-2.5 pl-10 pr-10 text-chalk placeholder:text-dust focus:border-edge-lit focus:outline-none"
        />
        {value.query && (
          <button
            type="button"
            onClick={() => set('query', '')}
            aria-label="Borrar búsqueda"
            className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-dust hover:text-chalk active:scale-95"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        )}
      </div>

      <div className="mt-3 flex gap-1 rounded-xl border border-edge bg-pit p-1">
        {ownedOptions.map((opt) => {
          const active = value.ownedFilter === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => set('ownedFilter', opt.value)}
              aria-pressed={active}
              className={[
                'flex-1 rounded-lg py-2 text-[0.8rem] font-semibold transition-colors duration-150 active:scale-[0.97]',
                active ? 'bg-edge-lit text-chalk' : 'text-ash',
              ].join(' ')}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Chip
          label="Todas"
          active={value.season === 'todas' && value.rarity === 'todas'}
          onClick={() => onChange({ ...value, season: 'todas', rarity: 'todas' })}
        />
        {seasons.map((s) => (
          <Chip
            key={s.id}
            label={s.shortName}
            active={value.season === s.id}
            onClick={() => set('season', value.season === s.id ? 'todas' : s.id)}
          />
        ))}
        <span className="my-1 w-px shrink-0 bg-edge" aria-hidden="true" />
        {rarities.map((r) => (
          <Chip
            key={r}
            label={rarityLabel(r)}
            color={rarityColor(r)}
            active={value.rarity === r}
            onClick={() => set('rarity', value.rarity === r ? 'todas' : r)}
          />
        ))}
      </div>
    </div>
  )
}

function Chip({
  label,
  active,
  color,
  onClick,
}: {
  label: string
  active: boolean
  color?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="shrink-0 rounded-full border px-3.5 py-1.5 text-[0.78rem] font-semibold transition-[background-color,border-color,color] duration-150 active:scale-[0.97]"
      style={{
        borderColor: active ? (color ?? 'var(--color-edge-lit)') : 'var(--color-edge)',
        background: active
          ? `color-mix(in oklab, ${color ?? 'var(--color-chalk)'} 16%, transparent)`
          : 'transparent',
        color: active ? (color ?? 'var(--color-chalk)') : 'var(--color-ash)',
      }}
    >
      {label}
    </button>
  )
}
