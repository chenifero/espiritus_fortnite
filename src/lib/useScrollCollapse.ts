import { useEffect, useRef, useState } from 'react'

/**
 * true mientras se baja pasado el umbral; vuelve a false en cuanto se sube
 * un poco o se está cerca del principio de la página.
 *
 * Compara contra el punto del último cambio de dirección, no frame a frame:
 * así un scroll con sacudidas de 1-2px (inercia) no dispara el toggle en
 * cada frame. Además, tras cada cambio de estado, ignora el scroll durante
 * lo que dura la transición de la cabecera (`settleMs`): colapsar/expandir
 * cambia su altura, y en páginas cortas eso reduce el alto total del
 * documento lo suficiente para que el navegador reajuste `scrollY` de golpe
 * (lo deja «clampado» al nuevo máximo). Sin este margen ese reajuste se leía
 * como un scroll hacia arriba genuino y disparaba el cambio contrario,
 * entrando en bucle con la propia animación — el parpadeo se nota sobre
 * todo con pocas filas de espíritus porque ahí el recorte de altura es una
 * fracción grande de lo que queda por scrollear.
 */
export function useScrollCollapse(threshold = 24, flipDelta = 12, settleMs = 350) {
  const [collapsed, setCollapsed] = useState(false)
  const lastY = useRef(0)
  const dir = useRef<1 | -1 | 0>(0)
  const runStartY = useRef(0)
  const collapsedRef = useRef(false)
  const settledAt = useRef(0)

  useEffect(() => {
    lastY.current = window.scrollY
    runStartY.current = window.scrollY
    let ticking = false

    const flip = (next: boolean) => {
      if (collapsedRef.current === next) return
      collapsedRef.current = next
      settledAt.current = performance.now() + settleMs
      setCollapsed(next)
    }

    const update = () => {
      const y = window.scrollY
      const delta = y - lastY.current
      lastY.current = y

      if (y <= threshold) {
        flip(false)
        dir.current = 0
        runStartY.current = y
        ticking = false
        return
      }

      if (performance.now() < settledAt.current) {
        // La cabecera todavía está animando su propio alto: no uses este
        // tramo para decidir dirección, puede ser un reajuste del navegador
        // y no un scroll del usuario.
        dir.current = 0
        runStartY.current = y
        ticking = false
        return
      }

      if (delta !== 0) {
        const newDir = delta > 0 ? 1 : -1
        if (newDir !== dir.current) {
          dir.current = newDir
          runStartY.current = lastY.current - delta
        }
        const traveled = y - runStartY.current
        if (newDir === 1 && traveled > flipDelta) {
          flip(true)
        } else if (newDir === -1 && traveled < -flipDelta) {
          flip(false)
        }
      }

      ticking = false
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold, flipDelta, settleMs])

  return collapsed
}
