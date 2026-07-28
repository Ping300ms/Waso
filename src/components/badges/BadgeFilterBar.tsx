export type BadgeFilter = 'tous' | 'obtenus' | 'non-obtenus'

const LABELS: Record<BadgeFilter, string> = {
  tous: 'Tous',
  obtenus: 'Obtenus',
  'non-obtenus': 'Non obtenus',
}

export function BadgeFilterBar({
  filter,
  onFilterChange,
}: {
  filter: BadgeFilter
  onFilterChange: (f: BadgeFilter) => void
}) {
  return (
    <div className="flex gap-1 px-4 py-2">
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
  )
}
