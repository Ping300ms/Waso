import { useState } from 'react'
import { useLeaderboard, type LeaderboardEntry } from '../hooks/useLeaderboard'
import { LeaderboardTable, type LeaderboardSortBy } from '../components/classement/LeaderboardTable'
import { PlayerDetail } from '../components/profil/PlayerDetail'

export function Classement() {
  const { entries, fetchedAt, loading, offline } = useLeaderboard()
  const [sortBy, setSortBy] = useState<LeaderboardSortBy>('birdCount')
  const [selectedPlayer, setSelectedPlayer] = useState<LeaderboardEntry | null>(null)

  if (selectedPlayer) {
    return (
      <PlayerDetail
        playerId={selectedPlayer.userId}
        pseudo={selectedPlayer.pseudo}
        onBack={() => setSelectedPlayer(null)}
      />
    )
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Classement</h2>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as LeaderboardSortBy)}
          className="border rounded px-2 py-1 text-sm dark:bg-slate-900 dark:border-slate-700"
        >
          <option value="birdCount">Nb d'oiseaux</option>
          <option value="familyCount">Nb de familles</option>
          <option value="badgeCount">Nb de badges</option>
        </select>
      </div>

      {offline && (
        <p className="text-sm text-amber-600">
          Hors-ligne — dernière synchro {fetchedAt ? `le ${new Date(fetchedAt).toLocaleString('fr-FR')}` : 'jamais effectuée'}.
        </p>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Chargement...</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-slate-500">
          {offline ? 'Classement indisponible hors-ligne (aucune donnée en cache).' : 'Aucun joueur pour le moment.'}
        </p>
      ) : (
        <LeaderboardTable entries={entries} sortBy={sortBy} onSelectPlayer={setSelectedPlayer} />
      )}
    </div>
  )
}
