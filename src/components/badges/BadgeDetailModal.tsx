import type { BadgeState } from '../../domain/badges'
import { BIRDS_BY_FAMILY } from '../../data/birds'
import { useSightings } from '../../hooks/useSightings'

interface BadgeDetailModalProps {
  badge: BadgeState
  onClose: () => void
}

export function BadgeDetailModal({ badge, onClose }: BadgeDetailModalProps) {
  const sightings = useSightings()
  const caughtIds = new Set(sightings.map((s) => s.birdId))
  const birds = badge.famille ? (BIRDS_BY_FAMILY.get(badge.famille) ?? []) : []
  const sortedBirds = [...birds].sort((a, b) => {
    const aCaught = caughtIds.has(a.id)
    const bCaught = caughtIds.has(b.id)
    if (aCaught !== bCaught) return aCaught ? 1 : -1
    return a.frenchName.localeCompare(b.frenchName, 'fr')
  })

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 p-5 space-y-3 max-h-[80vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span aria-hidden>{badge.emoji}</span>
              {badge.label}
            </h2>
            <p className="text-sm text-slate-500">
              {badge.currentTier ? `${badge.currentTier.tierPct}% atteint` : 'Aucun palier atteint'}
              {badge.nextTier ? ` — prochain palier : ${badge.nextTier.tierPct}%` : ' — famille complète !'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 text-xl leading-none">
            ×
          </button>
        </div>

        {badge.kind === 'total' ? (
          <p className="text-sm text-slate-500">
            {badge.caught} / {badge.groupSize} oiseaux découverts au total — n'importe quel oiseau
            compte pour ce badge.
          </p>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {sortedBirds.map((bird) => {
              const caught = caughtIds.has(bird.id)
              return (
                <li key={bird.id} className="flex items-center justify-between py-2 text-sm">
                  <span className={caught ? '' : 'text-slate-400'}>{bird.frenchName}</span>
                  <span className={caught ? 'text-emerald-600' : 'text-slate-400'}>
                    {caught ? '✓ Capturé' : 'Manquant'}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
