import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

export function Login() {
  const { session, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (session) return <Navigate to="/wasodex" replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const { error: signInError } = await signIn(email, password)
    setSubmitting(false)
    setError(signInError)
  }

  return (
    <div className="min-h-svh flex items-center justify-center p-4 bg-white dark:bg-slate-950">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center flex items-center justify-center gap-2">
          <img src={`${import.meta.env.BASE_URL}icons/waso.svg`} alt="" className="h-8 w-auto" />
          Waso
        </h1>
        <p className="text-sm text-slate-500 text-center">
          Les comptes sont créés manuellement — pas d'inscription.
        </p>

        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2 dark:bg-slate-900 dark:border-slate-700"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Mot de passe</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2 dark:bg-slate-900 dark:border-slate-700"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2 rounded bg-violet-600 text-white disabled:opacity-50"
        >
          {submitting ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </div>
  )
}
