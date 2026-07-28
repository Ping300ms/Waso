import type { PlayerSummary } from '../../hooks/usePlayers'

interface PlayerListProps {
  players: PlayerSummary[]
  onSelect: (player: PlayerSummary) => void
}

export function PlayerList({ players, onSelect }: PlayerListProps) {
  return (
    <ul className="divide-y divide-slate-200 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800">
      {players.map((player) => (
        <li key={player.id}>
          <button
            type="button"
            onClick={() => onSelect(player)}
            className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-900"
          >
            {player.pseudo}
          </button>
        </li>
      ))}
    </ul>
  )
}
