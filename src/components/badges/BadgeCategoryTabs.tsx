import { CATEGORY_LABELS, type BadgeCategory } from '../../domain/badges'

type TabCategory = Exclude<BadgeCategory, 'special'>

const TAB_ORDER: TabCategory[] = [
  'famille',
  'temporalite',
  'terrain',
  'physique',
  'comportement',
  'progression',
]

interface BadgeCategoryTabsProps {
  activeCategory: TabCategory
  onChange: (category: TabCategory) => void
}

export function BadgeCategoryTabs({ activeCategory, onChange }: BadgeCategoryTabsProps) {
  return (
    <div className="flex gap-1 overflow-x-auto px-4 py-2 -mx-1">
      {TAB_ORDER.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onChange(category)}
          className={`shrink-0 text-sm px-3 py-1 rounded-full border whitespace-nowrap ${
            activeCategory === category
              ? 'bg-violet-600 text-white border-violet-600'
              : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          {CATEGORY_LABELS[category]}
        </button>
      ))}
    </div>
  )
}
