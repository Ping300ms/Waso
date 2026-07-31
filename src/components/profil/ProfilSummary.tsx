interface ProfilSummaryProps {
  pseudo: string
  birdCount: number
  familyCount: number
  badgeCount: number
  totalBirds: number
  totalFamilies: number
  totalBadges: number
}

export function ProfilSummary({
  pseudo,
  birdCount,
  familyCount,
  badgeCount,
  totalBirds,
  totalFamilies,
  totalBadges,
}: ProfilSummaryProps) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-center">
      <h2 className="text-2xl font-bold">{pseudo}</h2>
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <p className="text-3xl font-bold text-violet-600 dark:text-violet-400">{birdCount}</p>
          <p className="text-xs text-slate-500">/ {totalBirds} oiseaux</p>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-bold text-violet-600 dark:text-violet-400">{familyCount}</p>
          <p className="text-xs text-slate-500">/ {totalFamilies} familles</p>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-bold text-violet-600 dark:text-violet-400">{badgeCount}</p>
          <p className="text-xs text-slate-500">/ {totalBadges} badges</p>
        </div>
      </div>
    </div>
  )
}
