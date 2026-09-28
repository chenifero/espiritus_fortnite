import {
  Download,
  EllipsisVertical,
  Mail,
  Share,
  Smartphone,
  SquareArrowUp,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { detectPlatform } from '../lib/platform'
import { useInstallPrompt } from '../lib/useInstallPrompt'
import { OnboardingSheet } from './OnboardingSheet'

type Props = {
  signedIn: boolean
  onClose: () => void
}

export function OnboardingInstall({ signedIn, onClose }: Props) {
  return (
    <OnboardingSheet
      title="Instálala en tu pantalla de inicio"
      subtitle="Ábrela en un toque, como cualquier otra app, incluso sin conexión."
      primaryLabel="Entendido"
      onClose={onClose}
    >
      {!signedIn && (
        <div className="flex gap-3 border-b border-edge py-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-edge-lit bg-slab text-ash">
            <Mail size={17} strokeWidth={2.25} />
          </span>
          <div className="min-w-0 pt-1 text-[0.9rem] leading-relaxed">
            <p>
              <span className="font-semibold text-chalk">Antes de instalar:</span> si vas a guardar
              tu colección por email, hazlo ahora y abre el enlace de confirmación aquí, en el
              navegador.
            </p>
            <p className="mt-1.5 text-ash">
              Si instalas la app primero, ese enlace se abrirá en el navegador y no en la app
              instalada, así que tu colección guardada no aparecerá dentro de ella.
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3 py-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-edge-lit bg-slab text-ash">
          <Smartphone size={17} strokeWidth={2.25} />
        </span>
        <div className="min-w-0 pt-1 text-[0.9rem] leading-relaxed text-ash">
          <InstallHelp />
        </div>
      </div>
    </OnboardingSheet>
  )
}

function InstallHelp() {
  const { canPromptInstall, promptInstall, installed } = useInstallPrompt()
  const platform = detectPlatform()

  if (installed) {
    return (
      <>
        Ya la tienes instalada. Ábrela desde el icono que has añadido a tu pantalla de inicio,
        como cualquier otra app.
      </>
    )
  }

  if (canPromptInstall) {
    return (
      <>
        <span>Tu navegador puede instalarla directamente, sin pasar por la tienda de apps.</span>
        <button
          type="button"
          onClick={() => void promptInstall()}
          className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-edge-lit px-3 py-1.5 text-[0.8rem] font-semibold text-chalk transition-colors hover:border-ash active:scale-[0.97]"
        >
          <Download size={14} strokeWidth={2.5} />
          Instalar SpiritDex
        </button>
      </>
    )
  }

  if (platform === 'ios') {
    return (
      <>
        <span>En Safari, para que aparezca un icono en tu pantalla de inicio:</span>
        <ol className="mt-2 space-y-1.5">
          <InstallStep n={1}>
            Toca el icono de compartir{' '}
            <SquareArrowUp size={13} strokeWidth={2.5} className="inline" /> en la barra inferior
            (o superior en iPad).
          </InstallStep>
          <InstallStep n={2}>
            Desplázate y elige <span className="text-chalk">«Añadir a pantalla de inicio»</span>.
          </InstallStep>
          <InstallStep n={3}>Confirma pulsando «Añadir» arriba a la derecha.</InstallStep>
        </ol>
      </>
    )
  }

  if (platform === 'android') {
    return (
      <>
        <span>En Chrome:</span>
        <ol className="mt-2 space-y-1.5">
          <InstallStep n={1}>
            Toca el menú <EllipsisVertical size={13} strokeWidth={2.5} className="inline" /> arriba
            a la derecha.
          </InstallStep>
          <InstallStep n={2}>
            Elige <span className="text-chalk">«Instalar app»</span> o «Añadir a pantalla de
            inicio».
          </InstallStep>
        </ol>
      </>
    )
  }

  return (
    <>
      <span>
        En Chrome o Edge, busca el icono de instalar{' '}
        <Download size={13} strokeWidth={2.5} className="inline" /> al final de la barra de
        direcciones. En Safari o Firefox, usa el menú{' '}
        <Share size={13} strokeWidth={2.5} className="inline" /> de compartir y elige «Añadir al
        Dock» o similar.
      </span>
    </>
  )
}

function InstallStep({ n, children }: { n: number; children: ReactNode }) {
  return (
    <li className="flex gap-2">
      <span
        className="tabular grid h-5 w-5 shrink-0 place-items-center rounded-full text-[0.7rem] font-bold text-void"
        style={{ background: 'var(--color-ash)' }}
      >
        {n}
      </span>
      <span className="text-ash">{children}</span>
    </li>
  )
}
