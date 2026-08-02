import type { BadgeState } from "../../domain/badges";

export function BadgeCard({
  badge,
  onClick,
}: {
  badge: BadgeState;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl p-3 min-h-28 flex flex-col items-center justify-center gap-1 text-center ${
        badge.obtained
          ? "bg-violet-50 dark:bg-violet-950"
          : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 opacity-70"
      }`}
    >
      <span className="text-3xl" aria-hidden>
        {badge.emoji}
      </span>
      <p className="text-xs font-medium leading-tight">{badge.label}</p>
      <p className="text-xs text-slate-500">{Math.round(badge.progressPct)}%</p>
      {badge.nextTier && (
        <div className="w-full mt-1">
          <div className="h-1.5 w-full rounded-full bg-slate-300 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full bg-violet-500"
              style={{ width: `${Math.min(100, badge.progressPct)}%` }}
            />
          </div>
        </div>
      )}
    </button>
  );
}
