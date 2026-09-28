import { useState } from 'react'

const KEY_USAGE = 'espiritus:onboarding:uso:v1'
const KEY_INSTALL = 'espiritus:onboarding:instalar:v1'

function seen(key: string): boolean {
  try {
    return Boolean(localStorage.getItem(key))
  } catch {
    /* sin almacenamiento, se pierde el "ya lo vi" pero la app sigue */
    return true
  }
}

function markSeen(key: string) {
  try {
    localStorage.setItem(key, '1')
  } catch {
    /* ídem */
  }
}

export type OnboardingStage = 'uso' | 'instalar' | null

/**
 * Dos guías separadas: primero cómo se usa la app, luego cómo instalarla.
 * La segunda solo aparece encadenada tras la primera la primera vez que se
 * visita; el botón de ayuda solo reabre la de uso.
 */
export function useOnboarding() {
  const [stage, setStage] = useState<OnboardingStage>(() => {
    if (!seen(KEY_USAGE)) return 'uso'
    if (!seen(KEY_INSTALL)) return 'instalar'
    return null
  })

  const closeUsage = () => {
    markSeen(KEY_USAGE)
    setStage(seen(KEY_INSTALL) ? null : 'instalar')
  }

  const closeInstall = () => {
    markSeen(KEY_INSTALL)
    setStage(null)
  }

  // Solo importa mientras la guía de uso está abierta: si al cerrarla la de
  // instalar sigue pendiente, el botón de esa pantalla debe decir "Siguiente".
  const installPending = !seen(KEY_INSTALL)

  return { stage, installPending, showUsage: () => setStage('uso'), closeUsage, closeInstall }
}
