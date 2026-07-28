import { SORT_LABELS, type SortKey } from '../../domain/sort'

export type CaughtFilter = 'tous' | 'vus' | 'non-vus'

interface SortFilterBarProps {
  sortKey: SortKey
  onSortKeyChange: (key: SortKey) => void
  filter: CaughtFilter
  onFilterChange: (filter: CaughtFilter) => void
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
}: SortFilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3 items-center px-4 py-2">
      <label className="text-sm flex items-center gap-2">
        Trier par
        <select
          value={sortKey}
          onChange={(e) => onSortKeyChange(e.target.value as SortKey)}
          className="border rounded px-2 py-1 text-sm bg-white dark:bg-slate-900 dark:border-slate-700"
        >
          {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
            <option key={key} value={key}>
              {SORT_LABELS[key]}
            </option>
          ))}
        </select>
      </label>

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
    </div>
  )
}
