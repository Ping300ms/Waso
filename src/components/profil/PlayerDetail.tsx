import { ALL_BIRDS, FAMILIES } from '../../data/birds'
import { usePlayerSightings } from '../../hooks/usePlayers'
import { useBadgesForSightings } from '../../hooks/useBadges'
import { BadgeGrid } from '../badges/BadgeGrid'
import { BirdGrid } from '../wasodex/BirdGrid'

interface PlayerDetailProps {
  playerId: string
  pseudo: string
  onBack: () => void
}

export function PlayerDetail({ playerId, pseudo, onBack }: PlayerDetailProps) {
  const { sightings, loading } = usePlayerSightings(playerId)
  const badges = useBadgesForSightings(sightings)
  const caughtIds = new Set(sightings.map((s) => s.birdId))
  const datesByBirdId = new Map(sightings.map((s) => [s.birdId, s.firstSeenDate]))
  const familyCount = FAMILIES.filter((f) =>
    ALL_BIRDS.some((b) => b.famille === f && caughtIds.has(b.id))
  ).length

  return (
    <div>
      <div className="p-4 flex items-center gap-3">
        <button type="button" onClick={onBack} className="text-sm text-violet-600">
          ← Retour
        </button>
        <h2 className="text-lg font-bold">{pseudo}</h2>
      </div>

      {loading ? (
        <p className="px-4 text-sm text-slate-500">Chargement...</p>
      ) : (
        <>
          <p className="px-4 text-sm text-slate-500">
            {caughtIds.size} / {ALL_BIRDS.length} oiseaux · {familyCount} / {FAMILIES.length} familles
          </p>
          <h3 className="px-4 pt-3 font-medium text-sm">Badges obtenus</h3>
          <BadgeGrid badges={badges.filter((b) => b.obtained)} />
          <h3 className="px-4 pt-1 font-medium text-sm">Wasodex</h3>
          <BirdGrid birds={ALL_BIRDS} caughtIds={caughtIds} datesByBirdId={datesByBirdId} />
        </>
      )}
    </div>
  )
}
