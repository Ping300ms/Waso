import { SORT_LABELS, type SortKey } from '../../domain/sort'
import { SearchBar } from '../common/SearchBar'
import { SortMenu } from '../common/SortMenu'

export type CaughtFilter = 'tous' | 'vus' | 'non-vus'

interface SortFilterBarProps {
  sortKey: SortKey
  onSortKeyChange: (key: SortKey) => void
  filter: CaughtFilter
  onFilterChange: (filter: CaughtFilter) => void
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  countLabel?: string
}

const FILTER_LABELS: Record<CaughtFilter, string> = {
  tous: 'Tous',
  vus: 'Vus',
  'non-vus': 'Non vus',
}

export function SortFilterBar({
  sortKey,
  onSortKeyChange,
  filter,
  onFilterChange,
  searchQuery,
  onSearchQueryChange,
  countLabel,
}: SortFilterBarProps) {
  return (
    <div className="space-y-2 px-4 py-2">
      <div className="flex items-center gap-2">
        <SearchBar
          value={searchQuery}
          onChange={onSearchQueryChange}
          placeholder="Rechercher un oiseau..."
        />
        <SortMenu value={sortKey} options={SORT_LABELS} onChange={onSortKeyChange} />
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1">
          {(Object.keys(FILTER_LABELS) as CaughtFilter[]).map((key) => (
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
              {FILTER_LABELS[key]}
            </button>
          ))}
        </div>
        {countLabel && <p className="text-sm text-slate-500 whitespace-nowrap">{countLabel}</p>}
      </div>
    </div>
  )
}
