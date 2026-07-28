import type { LeaderboardEntry } from '../../hooks/useLeaderboard'

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  sortBy: 'birdCount' | 'familyCount'
}

export function LeaderboardTable({ entries, sortBy }: LeaderboardTableProps) {
  const sorted = [...entries].sort((a, b) => b[sortBy] - a[sortBy])

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-slate-500 border-b border-slate-200 dark:border-slate-800">
          <th className="py-2 px-4">#</th>
          <th className="py-2 px-4">Pseudo</th>
          <th className="py-2 px-4 text-right">Oiseaux</th>
          <th className="py-2 px-4 text-right">Familles</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((entry, i) => (
          <tr key={entry.userId} className="border-b border-slate-100 dark:border-slate-900">
            <td className="py-2 px-4">{i + 1}</td>
            <td className="py-2 px-4 font-medium">{entry.pseudo}</td>
            <td className="py-2 px-4 text-right">{entry.birdCount}</td>
            <td className="py-2 px-4 text-right">{entry.familyCount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
