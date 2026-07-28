import type { BadgeState } from '../../domain/badges'

export function BadgeCard({ badge }: { badge: BadgeState }) {
  return (
    <div
      className={`rounded-xl border-2 p-3 flex flex-col items-center gap-1 text-center ${
        badge.obtained
          ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-400'
          : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 opacity-70'
      }`}
    >
      <span className="text-3xl" aria-hidden>
        {badge.emoji}
      </span>
      <p className="text-xs font-medium leading-tight">{badge.label}</p>
      {!badge.obtained && (
        <div className="w-full mt-1">
          <div className="h-1.5 w-full rounded-full bg-slate-300 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full bg-violet-500"
              style={{ width: `${Math.min(100, badge.progressPct)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {badge.caught}/{badge.threshold} ({Math.round(badge.progressPct)}%)
          </p>
        </div>
      )}
    </div>
  )
}
