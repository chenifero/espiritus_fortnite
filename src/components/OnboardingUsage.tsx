import { Crown, Hand, Mail, Search, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { OnboardingSheet } from './OnboardingSheet'

type Props = {
  primaryLabel: string
  onClose: () => void
}

export function OnboardingUsage({ primaryLabel, onClose }: Props) {
  return (
    <OnboardingSheet
      title="Bienvenido a SpiritDex"
      subtitle="Guía rápida para no perderte nada."
      primaryLabel={primaryLabel}
      onClose={onClose}
    >
      <Step icon={Sparkles} title="Tu colección de espíritus">
        SpiritDex lleva la cuenta de qué espíritus de Fortnite tienes, temporada a temporada. Cada
        espíritu puede tener varias variantes (dorada, gema, holofoil…) y tú marcas cuáles has
        conseguido.
      </Step>

      <Step icon={Hand} title="Marca tus cartas">
        Toca una carta para marcarla como tuya. Tócala otra vez y queda{' '}
        <span className="font-semibold" style={{ color: '#ffc42e' }}>
          dominada
        </span>{' '}
        <Crown
          size={13}
          strokeWidth={2.5}
          className="inline -translate-y-px"
          style={{ color: '#ffc42e' }}
          fill="currentColor"
          fillOpacity={0.25}
        />
        . Un tercer toque la quita. Dentro de la ficha de un espíritu también puedes pulsar la
        corona directamente, o «Marcar todas» para ir más rápido.
      </Step>

      <Step icon={Search} title="Busca y filtra">
        Usa el buscador, los chips de temporada y rareza, o el interruptor{' '}
        <span className="text-chalk">Todos / Completos / Me faltan</span> para encontrar justo lo
        que necesitas.
      </Step>

      <Step icon={Mail} title="Guarda tu colección">
        Sin cuenta, tu progreso se queda solo en este dispositivo. Pulsa «Guardar mi colección»
        arriba y te mandamos un enlace por email: ábrelo también desde el móvil, la tablet o el
        ordenador para tener siempre la misma colección sincronizada.
      </Step>
    </OnboardingSheet>
  )
}

function Step({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Sparkles
  title: string
  children: ReactNode
}) {
  return (
    <div className="flex gap-3 border-b border-edge py-4 last:border-b-0">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-edge-lit bg-slab text-ash">
        <Icon size={17} strokeWidth={2.25} />
      </span>
      <div className="min-w-0 pt-1">
        <h3 className="font-display text-[0.95rem] font-extrabold" style={{ fontStretch: '112%' }}>
          {title}
        </h3>
        <p className="mt-1 text-[0.85rem] leading-relaxed text-ash">{children}</p>
      </div>
    </div>
  )
}
