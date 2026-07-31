import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoChevronBackOutline } from 'react-icons/io5'
import { useAuth } from '../auth/AuthProvider'
import { fetchOwnProfile, updatePseudo } from '../auth/authRepo'
import { ChangePasswordForm } from '../components/profil/ChangePasswordForm'
import { useOnlineStatus } from '../components/common/OfflineBanner'

export function Reglages() {
  const { session, signOut } = useAuth()
  const navigate = useNavigate()
  const online = useOnlineStatus()
  const [pseudoInput, setPseudoInput] = useState('')
  const [pseudoStatus, setPseudoStatus] = useState<string | null>(null)

  const userId = session?.user.id ?? null

  useEffect(() => {
    if (!userId) return
    fetchOwnProfile(userId).then((profile) => {
      if (profile) setPseudoInput(profile.pseudo)
    })
  }, [userId])

  async function handlePseudoSave() {
    if (!userId || !pseudoInput.trim()) return
    const { error } = await updatePseudo(userId, pseudoInput.trim())
    setPseudoStatus(error ?? 'Pseudo mis à jour.')
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/profil')}
          className="flex items-center gap-1 text-sm text-violet-600"
        >
          <IoChevronBackOutline size={18} aria-hidden />
          Retour
        </button>
        <h2 className="text-lg font-bold">Réglages</h2>
      </div>

      {online ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Changer de pseudo</h3>
            <input
              type="text"
              value={pseudoInput}
              onChange={(e) => setPseudoInput(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm dark:bg-slate-900 dark:border-slate-700"
            />
            <button
              type="button"
              onClick={handlePseudoSave}
              className="px-4 py-2 text-sm rounded bg-violet-600 text-white"
            >
              Enregistrer
            </button>
            {pseudoStatus && <p className="text-sm text-slate-500">{pseudoStatus}</p>}
          </div>

          <ChangePasswordForm />
        </div>
      ) : (
        <p className="text-sm text-amber-600">
          Changement de pseudo/mot de passe indisponible hors-ligne.
        </p>
      )}

      <button type="button" onClick={() => void signOut()} className="text-sm text-red-600">
        Se déconnecter
      </button>
    </div>
  )
}
