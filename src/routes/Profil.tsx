import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoSettingsOutline, IoChevronBackOutline, IoPeopleOutline } from 'react-icons/io5'
import { useAuth } from '../auth/AuthProvider'
import { fetchOwnProfile } from '../auth/authRepo'
import { useSightings } from '../hooks/useSightings'
import { useBadges } from '../hooks/useBadges'
import { usePlayers, type PlayerSummary } from '../hooks/usePlayers'
import { ALL_BIRDS, FAMILIES } from '../data/birds'
import { ProfilSummary } from '../components/profil/ProfilSummary'
import { PlayerList } from '../components/profil/PlayerList'
import { PlayerDetail } from '../components/profil/PlayerDetail'
import { useOnlineStatus } from '../components/common/OfflineBanner'

export function Profil() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const online = useOnlineStatus()
  const sightings = useSightings()
  const [pseudo, setPseudo] = useState<string | null>(null)
  const [showPlayers, setShowPlayers] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerSummary | null>(null)

  const userId = session?.user.id ?? null

  useEffect(() => {
    if (!userId) return
    fetchOwnProfile(userId).then((profile) => {
      if (profile) setPseudo(profile.pseudo)
    })
  }, [userId])

  const { players } = usePlayers()
  const badges = useBadges()

  const caughtIds = new Set(sightings.map((s) => s.birdId))
  const familyCount = FAMILIES.filter((f) =>
    ALL_BIRDS.some((b) => b.famille === f && caughtIds.has(b.id))
  ).length
  const badgeCount = badges.filter((b) => b.obtained).length

  if (selectedPlayer) {
    return (
      <PlayerDetail
        playerId={selectedPlayer.id}
        pseudo={selectedPlayer.pseudo}
        onBack={() => setSelectedPlayer(null)}
      />
    )
  }

  if (showPlayers) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowPlayers(false)}
            className="flex items-center gap-1 text-sm text-violet-600"
          >
            <IoChevronBackOutline size={18} aria-hidden />
            Retour
          </button>
          <h2 className="text-lg font-bold">Joueurs</h2>
        </div>
        {online ? (
          <PlayerList players={players} onSelect={setSelectedPlayer} />
        ) : (
          <p className="text-sm text-amber-600">Liste des joueurs indisponible hors-ligne.</p>
        )}
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => navigate('/reglages')}
          aria-label="Réglages"
          className="p-2 text-slate-500 dark:text-slate-400"
        >
          <IoSettingsOutline size={24} aria-hidden />
        </button>
      </div>

      <ProfilSummary
        pseudo={pseudo ?? session?.user.email ?? '...'}
        birdCount={caughtIds.size}
        familyCount={familyCount}
        badgeCount={badgeCount}
        totalBirds={ALL_BIRDS.length}
        totalFamilies={FAMILIES.length}
        totalBadges={badges.length}
      />

      <button
        type="button"
        onClick={() => setShowPlayers(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-800"
      >
        <IoPeopleOutline size={18} aria-hidden />
        Voir les joueurs
      </button>
    </div>
  )
}
