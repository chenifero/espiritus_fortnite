import { X } from 'lucide-react'
import type { ReactNode } from 'react'

type Props = {
  title: string
  subtitle: string
  primaryLabel: string
  onClose: () => void
  children: ReactNode
}

/** Envoltorio compartido por las guías de onboarding: mismo cristal que SpriteSheet. */
export function OnboardingSheet({ title, subtitle, primaryLabel, onClose, children }: Props) {
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
        aria-label={title}
        className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-edge bg-pit sm:rounded-3xl"
        style={{
          maxHeight: '90dvh',
          animation: 'sheet-rise 280ms var(--ease-out-strong)',
        }}
      >
        <div className="sticky top-0 z-10 flex justify-center bg-pit pb-1 pt-3 sm:hidden">
          <span className="h-1 w-9 rounded-full bg-edge-lit" />
        </div>

        <div className="flex items-start justify-between gap-3 px-5 pb-1 pt-1 sm:pt-5">
          <div>
            <h2
              className="font-display text-xl font-black leading-tight"
              style={{ fontStretch: '115%', letterSpacing: '-0.02em' }}
            >
              {title}
            </h2>
            <p className="mt-1 text-[0.85rem] leading-snug text-ash">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-edge text-ash transition-colors hover:text-chalk active:scale-95"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        <div
          className="min-h-0 flex-1 overflow-y-auto px-5 pb-2 pt-3"
          style={{ overscrollBehavior: 'contain' }}
        >
          {children}
        </div>

        <div
          className="border-t border-edge px-5 pb-5 pt-3"
          style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-edge-lit py-2.5 text-[0.85rem] font-semibold transition-colors hover:border-ash active:scale-[0.98]"
          >
            {primaryLabel}
          </button>
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
