import { useCallback, useEffect, useState } from 'react'

const KEY = 'espiritus:coleccion:v3'
const KEY_V2 = 'espiritus:coleccion:v2'
const KEY_V1 = 'espiritus:coleccion:v1'

/** Una carta pasa por tres estados: no la tienes, la tienes, la has dominado. */
export type CardState = 'owned' | 'mastered'

export type Collection = Record<string, CardState>

/**
 * v1 guardaba un id de espíritu; v2 una carta («<espiritu>:<variante>»); v3 añade
 * el estado de cada carta. Lo anterior entra como «la tienes».
 */
function read(): Collection {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Collection

    const v2 = localStorage.getItem(KEY_V2)
    if (v2) return Object.fromEntries((JSON.parse(v2) as string[]).map((c) => [c, 'owned']))

    const v1 = localStorage.getItem(KEY_V1)
    if (v1) return Object.fromEntries((JSON.parse(v1) as string[]).map((id) => [`${id}:base`, 'owned']))
  } catch {
    /* almacenamiento no disponible o corrupto: se empieza vacío */
  }
  return {}
}

/**
 * Qué cartas tiene el usuario y en qué estado, con la carta identificada como
 * «<espiritu>:<variante>». Hoy vive en localStorage; cuando entre Supabase solo
 * cambia este archivo.
 */
export function useCollection() {
  const [cards, setCards] = useState<Collection>(read)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(cards))
    } catch {
      /* sin almacenamiento la sesión sigue funcionando, solo no persiste */
    }
  }, [cards])

  /** Ciclo al pulsar: no la tienes → la tienes → dominada → no la tienes. */
  const cycle = useCallback((card: string) => {
    setCards((prev) => {
      const next = { ...prev }
      if (!next[card]) next[card] = 'owned'
      else if (next[card] === 'owned') next[card] = 'mastered'
      else delete next[card]
      return next
    })
  }, [])

  const setMany = useCallback((list: string[], state: CardState | null) => {
    setCards((prev) => {
      const next = { ...prev }
      for (const card of list) {
        if (state) next[card] = state
        else delete next[card]
      }
      return next
    })
  }, [])

  return { cards, cycle, setMany }
}
