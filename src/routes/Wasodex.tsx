import { useMemo, useState } from 'react'
import { ALL_BIRDS, type Bird } from '../data/birds'
import { useSightings } from '../hooks/useSightings'
import { BirdGrid } from '../components/wasodex/BirdGrid'
import { SortFilterBar, type CaughtFilter } from '../components/wasodex/SortFilterBar'
import { AddSightingModal } from '../components/wasodex/AddSightingModal'
import { CatchAnimation } from '../components/wasodex/CatchAnimation'
import { DEFAULT_SORT_KEY, getBirdComparator, type SortKey } from '../domain/sort'

export function Wasodex() {
  const sightings = useSightings()
  const [sortKey, setSortKey] = useState<SortKey>(DEFAULT_SORT_KEY)
  const [filter, setFilter] = useState<CaughtFilter>('tous')
  const [modalOpen, setModalOpen] = useState(false)
  const [celebrating, setCelebrating] = useState<Bird | null>(null)

  const sightingsByBirdId = useMemo(() => new Map(sightings.map((s) => [s.birdId, s])), [sightings])
  const caughtIds = useMemo(() => new Set(sightings.map((s) => s.birdId)), [sightings])
  const datesByBirdId = useMemo(
    () => new Map(sightings.map((s) => [s.birdId, s.firstSeenDate])),
    [sightings]
  )

  const visibleBirds = useMemo(() => {
    let birds = ALL_BIRDS
    if (filter === 'vus') birds = birds.filter((b) => caughtIds.has(b.id))
    if (filter === 'non-vus') birds = birds.filter((b) => !caughtIds.has(b.id))
    return [...birds].sort(getBirdComparator(sortKey, sightingsByBirdId))
  }, [filter, sortKey, caughtIds, sightingsByBirdId])

  return (
    <div>
      <div className="flex items-center justify-between px-4 pt-3">
        <p className="text-sm text-slate-500">
          {caughtIds.size} / {ALL_BIRDS.length} oiseaux découverts
        </p>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-3 py-1.5 text-sm rounded bg-violet-600 text-white"
        >
          + Ajouter
        </button>
      </div>

      <SortFilterBar
        sortKey={sortKey}
        onSortKeyChange={setSortKey}
        filter={filter}
        onFilterChange={setFilter}
      />

      <BirdGrid birds={visibleBirds} caughtIds={caughtIds} datesByBirdId={datesByBirdId} />

      {modalOpen && (
        <AddSightingModal
          onClose={() => setModalOpen(false)}
          onSaved={(bird) => {
            setModalOpen(false)
            setCelebrating(bird)
          }}
        />
      )}

      {celebrating && (
        <CatchAnimation bird={celebrating} onDone={() => setCelebrating(null)} />
      )}
    </div>
  )
}
