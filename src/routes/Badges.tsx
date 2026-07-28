import { useMemo, useState } from 'react'
import { useBadges } from '../hooks/useBadges'
import { BadgeGrid } from '../components/badges/BadgeGrid'
import { BadgeFilterBar, type BadgeFilter } from '../components/badges/BadgeFilterBar'

export function Badges() {
  const badges = useBadges()
  const [filter, setFilter] = useState<BadgeFilter>('tous')

  const visible = useMemo(() => {
    if (filter === 'obtenus') return badges.filter((b) => b.obtained)
    if (filter === 'non-obtenus') return badges.filter((b) => !b.obtained)
    return badges
  }, [badges, filter])

  const obtainedCount = badges.filter((b) => b.obtained).length

  return (
    <div>
      <p className="text-sm text-slate-500 px-4 pt-3">
        {obtainedCount} / {badges.length} badges obtenus
      </p>
      <BadgeFilterBar filter={filter} onFilterChange={setFilter} />
      <BadgeGrid badges={visible} />
    </div>
  )
}
