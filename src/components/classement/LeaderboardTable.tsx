import type { LeaderboardEntry } from "../../hooks/useLeaderboard";

export type LeaderboardSortBy = "birdCount" | "familyCount" | "badgeCount";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  sortBy: LeaderboardSortBy;
  onSelectPlayer: (entry: LeaderboardEntry) => void;
}

export function LeaderboardTable({
  entries,
  sortBy,
  onSelectPlayer,
}: LeaderboardTableProps) {
  const sorted = [...entries].sort((a, b) => b[sortBy] - a[sortBy]);

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-slate-500 border-b border-slate-200 dark:border-slate-800">
          <th className="py-2 px-4">#</th>
          <th className="py-2 px-4">Pseudo</th>
          {sortBy === "birdCount" && (
            <th className="py-2 px-4 text-right">Oiseaux</th>
          )}
          {sortBy === "familyCount" && (
            <th className="py-2 px-4 text-right">Familles</th>
          )}
          {sortBy === "badgeCount" && (
            <th className="py-2 px-4 text-right">Badges</th>
          )}
        </tr>
      </thead>
      <tbody>
        {sorted.map((entry, i) => (
          <tr
            key={entry.userId}
            onClick={() => onSelectPlayer(entry)}
            className="border-b border-slate-100 dark:border-slate-900 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900"
          >
            <td className="py-2 px-4">{i + 1}</td>
            <td className="py-2 px-4 font-medium">{entry.pseudo}</td>
            {sortBy === "birdCount" && (
              <td className="py-2 px-4 text-right">{entry.birdCount}</td>
            )}
            {sortBy === "familyCount" && (
              <td className="py-2 px-4 text-right">{entry.familyCount}</td>
            )}
            {sortBy === "badgeCount" && (
              <td className="py-2 px-4 text-right">{entry.badgeCount}</td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
