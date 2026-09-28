import { useEffect, useRef, useState } from 'react'

/**
 * true mientras se baja pasado el umbral; vuelve a false en cuanto se sube
 * un poco o se está cerca del principio de la página.
 */
export function useScrollCollapse(threshold = 24) {
  const [collapsed, setCollapsed] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    lastY.current = window.scrollY
    let ticking = false

    const update = () => {
      const y = window.scrollY
      if (y <= threshold) {
        setCollapsed(false)
      } else if (y > lastY.current) {
        setCollapsed(true)
      } else if (y < lastY.current) {
        setCollapsed(false)
      }
      lastY.current = y
      ticking = false
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return collapsed
}
