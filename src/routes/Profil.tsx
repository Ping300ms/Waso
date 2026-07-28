import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { fetchOwnProfile, updatePseudo } from '../auth/authRepo'
import { useSightings } from '../hooks/useSightings'
import { usePlayers, type PlayerSummary } from '../hooks/usePlayers'
import { ALL_BIRDS, FAMILIES } from '../data/birds'
import { ProfilSummary } from '../components/profil/ProfilSummary'
import { ChangePasswordForm } from '../components/profil/ChangePasswordForm'
import { PlayerList } from '../components/profil/PlayerList'
import { PlayerDetail } from '../components/profil/PlayerDetail'
import { useOnlineStatus } from '../components/common/OfflineBanner'

export function Profil() {
  const { session, signOut } = useAuth()
  const online = useOnlineStatus()
  const sightings = useSightings()
  const [pseudo, setPseudo] = useState<string | null>(null)
  const [pseudoInput, setPseudoInput] = useState('')
  const [pseudoStatus, setPseudoStatus] = useState<string | null>(null)
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerSummary | null>(null)

  const userId = session?.user.id ?? null

  useEffect(() => {
    if (!userId) return
    fetchOwnProfile(userId).then((profile) => {
      if (profile) {
        setPseudo(profile.pseudo)
        setPseudoInput(profile.pseudo)
      }
    })
  }, [userId])

  const { players } = usePlayers()

  const caughtIds = new Set(sightings.map((s) => s.birdId))
  const familyCount = FAMILIES.filter((f) =>
    ALL_BIRDS.some((b) => b.famille === f && caughtIds.has(b.id))
  ).length

  if (selectedPlayer) {
    return (
      <PlayerDetail
        playerId={selectedPlayer.id}
        pseudo={selectedPlayer.pseudo}
        onBack={() => setSelectedPlayer(null)}
      />
    )
  }

  async function handlePseudoSave() {
    if (!userId || !pseudoInput.trim()) return
    const { error } = await updatePseudo(userId, pseudoInput.trim())
    setPseudoStatus(error ?? 'Pseudo mis à jour.')
    if (!error) setPseudo(pseudoInput.trim())
  }

  return (
    <div className="p-4 space-y-6">
      <ProfilSummary
        pseudo={pseudo ?? session?.user.email ?? '...'}
        birdCount={caughtIds.size}
        familyCount={familyCount}
        totalBirds={ALL_BIRDS.length}
        totalFamilies={FAMILIES.length}
      />

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

          <div className="space-y-2">
            <h3 className="font-medium text-sm">Joueurs</h3>
            <PlayerList players={players} onSelect={setSelectedPlayer} />
          </div>
        </div>
      ) : (
        <p className="text-sm text-amber-600">
          Changement de pseudo/mot de passe et liste des joueurs indisponibles hors-ligne.
        </p>
      )}

      <button type="button" onClick={() => void signOut()} className="text-sm text-red-600">
        Se déconnecter
      </button>
    </div>
  )
}
