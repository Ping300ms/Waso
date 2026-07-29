import { useMemo, useState } from 'react'
import { ALL_BIRDS, type Bird } from '../data/birds'
import { useSightings } from '../hooks/useSightings'
import { markSightingDeleted } from '../db/sightingsRepo'
import { runSync } from '../sync/syncEngine'
import { useAuth } from '../auth/AuthProvider'
import { BirdGrid } from '../components/wasodex/BirdGrid'
import { SortFilterBar, type CaughtFilter } from '../components/wasodex/SortFilterBar'
import { AddSightingModal } from '../components/wasodex/AddSightingModal'
import { CatchAnimation } from '../components/wasodex/CatchAnimation'
import { BirdDetailModal } from '../components/wasodex/BirdDetailModal'
import { DEFAULT_SORT_KEY, getBirdComparator, type SortKey } from '../domain/sort'

export function Wasodex() {
  const { session } = useAuth()
  const sightings = useSightings()
  const [sortKey, setSortKey] = useState<SortKey>(DEFAULT_SORT_KEY)
  const [filter, setFilter] = useState<CaughtFilter>('tous')
  const [modalOpen, setModalOpen] = useState(false)
  const [celebrating, setCelebrating] = useState<Bird | null>(null)
  const [selectedBird, setSelectedBird] = useState<Bird | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

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
    const query = searchQuery.trim().toLowerCase()
    if (query) {
      birds = birds.filter(
        (b) =>
          b.frenchName.toLowerCase().includes(query) ||
          b.scientificName.toLowerCase().includes(query)
      )
    }
    return [...birds].sort(getBirdComparator(sortKey, sightingsByBirdId))
  }, [filter, sortKey, searchQuery, caughtIds, sightingsByBirdId])

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
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />

      <BirdGrid
        birds={visibleBirds}
        caughtIds={caughtIds}
        datesByBirdId={datesByBirdId}
        onSelectBird={setSelectedBird}
      />

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

      {selectedBird && (
        <BirdDetailModal
          bird={selectedBird}
          firstSeenDate={datesByBirdId.get(selectedBird.id)}
          onClose={() => setSelectedBird(null)}
          onDelete={async () => {
            await markSightingDeleted(selectedBird.id)
            setSelectedBird(null)
            if (session?.user.id) void runSync(session.user.id)
          }}
        />
      )}
    </div>
  )
}
