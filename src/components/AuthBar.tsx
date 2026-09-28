import { Mail } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../lib/useAuth'

export function AuthBar() {
  const { user, status, sendMagicLink, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  if (status === 'loading') return null

  if (user) {
    return (
      <div className="mx-auto flex max-w-5xl items-center justify-end gap-3 px-4 py-2 text-[0.78rem] text-dust">
        <span className="truncate">{user.email}</span>
        <button
          type="button"
          onClick={() => signOut()}
          className="font-semibold text-ash underline decoration-edge-lit underline-offset-2 hover:text-chalk"
        >
          Cerrar sesión
        </button>
      </div>
    )
  }

  if (!open) {
    return (
      <div className="mx-auto flex max-w-5xl items-center justify-end px-4 py-2 text-[0.78rem]">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 font-semibold text-ash hover:text-chalk"
        >
          <Mail size={13} strokeWidth={2.5} />
          Guardar mi colección
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-2">
      {sent ? (
        <p className="text-right text-[0.78rem] text-ash">
          Te hemos enviado un enlace a <span className="text-chalk">{email}</span>. Ábrelo en este
          dispositivo para iniciar sesión.
        </p>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            setError(null)
            setSending(true)
            try {
              await sendMagicLink(email)
              setSent(true)
            } catch {
              setError('No se ha podido enviar el enlace. Inténtalo de nuevo.')
            } finally {
              setSending(false)
            }
          }}
          className="flex items-center justify-end gap-2"
        >
          {error && <span className="text-[0.75rem] text-legendario">{error}</span>}
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="w-44 rounded-lg border border-edge bg-pit px-3 py-1.5 text-[0.8rem] text-chalk placeholder:text-dust focus:border-edge-lit focus:outline-none"
          />
          <button
            type="submit"
            disabled={sending}
            className="rounded-lg border border-edge-lit px-3 py-1.5 text-[0.78rem] font-semibold transition-colors hover:border-ash active:scale-[0.97] disabled:opacity-50"
          >
            {sending ? 'Enviando…' : 'Enviar enlace'}
          </button>
        </form>
      )}
    </div>
  )
}
