import { Crown } from 'lucide-react'

type Props = {
  /** Lado del disco en px. La corona se escala con él. */
  size?: number
  className?: string
}

/**
 * Distintivo de carta dominada. Va deliberadamente fuera del marco, así que el
 * contenedor que lo coloca no puede recortar (nada de overflow-hidden).
 */
export function CrownBadge({ size = 30, className = '' }: Props) {
  return (
    <span
      className={`pointer-events-none grid place-items-center rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        transform: 'rotate(-14deg)',
        background: 'linear-gradient(150deg, #ffe9a3, #ffc42e 45%, #e8920c)',
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
