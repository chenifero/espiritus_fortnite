import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from './supabaseClient'

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

function write(cards: Collection) {
  try {
    localStorage.setItem(KEY, JSON.stringify(cards))
  } catch {
    /* sin almacenamiento la sesión sigue funcionando, solo no persiste */
  }
}

async function fetchRemote(userId: string): Promise<Collection> {
  const { data, error } = await supabase
    .from('collection_cards')
    .select('card, state')
    .eq('user_id', userId)
  if (error) throw error
  return Object.fromEntries((data ?? []).map((row) => [row.card as string, row.state as CardState]))
}

async function upsertRemote(userId: string, card: string, state: CardState) {
  const { error } = await supabase
    .from('collection_cards')
    .upsert({ user_id: userId, card, state, updated_at: new Date().toISOString() })
  if (error) throw error
}

async function deleteRemote(userId: string, card: string) {
  const { error } = await supabase
    .from('collection_cards')
    .delete()
    .eq('user_id', userId)
    .eq('card', card)
  if (error) throw error
}

const rank: Record<CardState, number> = { owned: 1, mastered: 2 }

/** Une dos colecciones sin perder progreso: para cada carta gana el estado más avanzado. */
function merge(a: Collection, b: Collection): Collection {
  const out: Collection = { ...a }
  for (const [card, state] of Object.entries(b)) {
    const current = out[card]
    out[card] = !current || rank[state] > rank[current] ? state : current
  }
  return out
}

/**
 * Qué cartas tiene el usuario y en qué estado, con la carta identificada como
 * «<espiritu>:<variante>». Sin sesión vive solo en localStorage (modo invitado).
 * Con sesión (userId) se sincroniza con Supabase; localStorage sigue actuando
 * como caché local para que la app siga funcionando sin conexión.
 */
export function useCollection(userId: string | null) {
  const [cards, setCards] = useState<Collection>(read)
  const cardsRef = useRef(cards)
  // undefined = todavía no se ha resuelto ninguna sesión (primera carga)
  const prevUserId = useRef<string | null | undefined>(undefined)

  useEffect(() => {
    cardsRef.current = cards
    write(cards)
  }, [cards])

  useEffect(() => {
    if (prevUserId.current === userId) return
    const previous = prevUserId.current
    prevUserId.current = userId

    if (!userId) {
      // Cierre de sesión real (no la primera carga sin sesión): no dejar en la
      // caché local cartas de una cuenta que ya no está activa en este dispositivo.
      if (previous) setCards({})
      return
    }

    // Solo tiene sentido conservar la caché local si viene de "invitado" (nunca
    // hubo sesión, o la sesión anterior era null) o de la primera carga de la
    // app. Si `previous` es OTRA cuenta ya autenticada, sería mezclar progreso
    // de una cuenta con la de otra: se descarta y se parte solo de lo remoto.
    const keepLocalCache = previous === undefined || previous === null

    let cancelled = false
    fetchRemote(userId)
      .then((remote) => {
        if (cancelled) return
        const merged = merge(keepLocalCache ? cardsRef.current : {}, remote)
        setCards(merged)
        for (const [card, state] of Object.entries(merged)) {
          if (remote[card] !== state) void upsertRemote(userId, card, state)
        }
      })
      .catch((err) => {
        console.error('No se pudo sincronizar la colección con Supabase', err)
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  const persist = useCallback(
    (card: string, state: CardState | null) => {
      if (!userId) return
      const task = state ? upsertRemote(userId, card, state) : deleteRemote(userId, card)
      task.catch((err) => console.error('No se pudo guardar la carta en Supabase', err))
    },
    [userId],
  )

  /** Ciclo al pulsar: no la tienes → la tienes → dominada → no la tienes. */
  const cycle = useCallback(
    (card: string) => {
      const current = cardsRef.current[card]
      const nextState: CardState | null = !current ? 'owned' : current === 'owned' ? 'mastered' : null
      setCards((prev) => {
        const next = { ...prev }
        if (nextState) next[card] = nextState
        else delete next[card]
        return next
      })
      persist(card, nextState)
    },
    [persist],
  )

  const setMany = useCallback(
    (list: string[], state: CardState | null) => {
      setCards((prev) => {
        const next = { ...prev }
        for (const card of list) {
          if (state) next[card] = state
          else delete next[card]
        }
        return next
      })
      for (const card of list) persist(card, state)
    },
    [persist],
  )

  return { cards, cycle, setMany }
}
