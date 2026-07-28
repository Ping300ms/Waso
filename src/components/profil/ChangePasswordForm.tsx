import { useState } from 'react'
import { useAuth } from '../../auth/AuthProvider'

export function ChangePasswordForm() {
  const { updatePassword } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      setStatus('Le mot de passe doit faire au moins 6 caractères.')
      return
    }
    if (password !== confirm) {
      setStatus('Les mots de passe ne correspondent pas.')
      return
    }
    setSaving(true)
    const { error } = await updatePassword(password)
    setSaving(false)
    setStatus(error ?? 'Mot de passe mis à jour.')
    if (!error) {
      setPassword('')
      setConfirm('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <h3 className="font-medium text-sm">Changer le mot de passe</h3>
      <input
        type="password"
        placeholder="Nouveau mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border rounded px-3 py-2 text-sm dark:bg-slate-900 dark:border-slate-700"
      />
      <input
        type="password"
        placeholder="Confirmer le mot de passe"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        className="w-full border rounded px-3 py-2 text-sm dark:bg-slate-900 dark:border-slate-700"
      />
      <button
        type="submit"
        disabled={saving}
        className="px-4 py-2 text-sm rounded bg-violet-600 text-white disabled:opacity-50"
      >
        {saving ? 'Enregistrement...' : 'Mettre à jour'}
      </button>
      {status && <p className="text-sm text-slate-500">{status}</p>}
    </form>
  )
}
