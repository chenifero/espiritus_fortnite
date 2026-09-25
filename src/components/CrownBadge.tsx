import { Crown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const GOLD_FACE = 'linear-gradient(150deg, #ffe9a3, #ffc42e 45%, #e8920c)'

type BadgeProps = {
  /** Lado del disco en px. La corona se escala con él. */
  size?: number
  className?: string
}

/**
 * Distintivo de carta dominada, sin interacción. Va deliberadamente fuera del
 * marco, así que quien lo coloca no puede recortar (nada de overflow-hidden).
 */
export function CrownBadge({ size = 30, className = '' }: BadgeProps) {
  return (
    <span
      className={`pointer-events-none grid place-items-center rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        transform: 'rotate(-14deg)',
        background: GOLD_FACE,
        boxShadow:
          '0 0 0 2px var(--color-void), 0 4px 10px -2px rgba(255, 180, 20, 0.65), 0 2px 4px rgba(0, 0, 0, 0.5)',
      }}
    >
      <Crown
        size={size * 0.54}
        strokeWidth={2.5}
        className="text-[#5a3200]"
        fill="currentColor"
        fillOpacity={0.22}
      />
    </span>
  )
}

type ButtonProps = {
  mastered: boolean
  /** Sin tener la carta no se puede dominar. */
  disabled: boolean
  onToggle: () => void
  label: string
  size?: number
  className?: string
}

/**
 * Botón de «Dominado». Ocupa el hueco del tick para que la acción esté a la vista
 * en vez de esconderse tras un segundo toque.
 */
export function CrownButton({
  mastered,
  disabled,
  onToggle,
  label,
  size = 22,
  className = '',
}: ButtonProps) {
  // El destello solo suena al dominar, no en el primer pintado ni al quitarlo.
  const [flash, setFlash] = useState(false)
  const previous = useRef(mastered)
  useEffect(() => {
    if (mastered && !previous.current) {
      setFlash(true)
      const t = setTimeout(() => setFlash(false), 700)
      previous.current = mastered
      return () => clearTimeout(t)
    }
    previous.current = mastered
  }, [mastered])

  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={mastered}
      aria-label={label}
      title={disabled ? 'Primero añádelo a la colección' : label}
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      className={[
        'absolute grid place-items-center rounded-full',
        'transition-[background-color,border-color,opacity,transform] duration-200 ease-[var(--ease-out-strong)]',
        disabled ? 'cursor-not-allowed opacity-30' : 'active:scale-90',
        mastered ? 'crown-pop' : '',
        flash ? 'crown-ring' : '',
        className,
      ].join(' ')}
      style={{
        width: size,
        height: size,
        transform: mastered ? 'rotate(-14deg)' : undefined,
        background: mastered ? GOLD_FACE : 'color-mix(in oklab, var(--color-void) 82%, transparent)',
        border: mastered ? 'none' : '1px solid var(--color-edge-lit)',
        boxShadow: mastered
          ? '0 0 0 2px var(--color-void), 0 4px 10px -2px rgba(255, 180, 20, 0.65)'
          : undefined,
      }}
    >
      <Crown
        size={size * 0.52}
        strokeWidth={2.5}
        className={mastered ? 'text-[#5a3200]' : 'text-dust'}
        fill={mastered ? 'currentColor' : 'none'}
        fillOpacity={mastered ? 0.22 : 0}
      />
    </button>
  )
}
