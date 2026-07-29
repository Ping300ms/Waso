import { SearchBar } from '../common/SearchBar'

export type BadgeFilter = 'tous' | 'obtenus' | 'non-obtenus'

const LABELS: Record<BadgeFilter, string> = {
  tous: 'Tous',
  obtenus: 'Obtenus',
  'non-obtenus': 'Non obtenus',
}

interface BadgeFilterBarProps {
  filter: BadgeFilter
  onFilterChange: (f: BadgeFilter) => void
  searchQuery: string
  onSearchQueryChange: (query: string) => void
}

export function BadgeFilterBar({
  filter,
  onFilterChange,
  searchQuery,
  onSearchQueryChange,
}: BadgeFilterBarProps) {
  return (
    <div className="space-y-2 px-4 py-2">
      <SearchBar
        value={searchQuery}
        onChange={onSearchQueryChange}
        placeholder="Rechercher un badge..."
      />

      <div className="flex gap-1">
        {(Object.keys(LABELS) as BadgeFilter[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onFilterChange(key)}
            className={`text-sm px-3 py-1 rounded-full border ${
              filter === key
                ? 'bg-violet-600 text-white border-violet-600'
                : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            {LABELS[key]}
          </button>
        ))}
      </div>
    </div>
  )
}
