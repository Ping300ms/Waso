import { useState } from 'react'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { LeaderboardTable } from '../components/classement/LeaderboardTable'

export function Classement() {
  const { entries, fetchedAt, loading, offline } = useLeaderboard()
  const [sortBy, setSortBy] = useState<'birdCount' | 'familyCount'>('birdCount')

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Classement</h2>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'birdCount' | 'familyCount')}
          className="border rounded px-2 py-1 text-sm dark:bg-slate-900 dark:border-slate-700"
        >
          <option value="birdCount">Nb d'oiseaux</option>
          <option value="familyCount">Nb de familles</option>
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
        <LeaderboardTable entries={entries} sortBy={sortBy} />
      )}
    </div>
  )
}
