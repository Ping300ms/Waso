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
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
      <h2 className="text-xl font-bold">{pseudo}</h2>
      <p className="text-sm text-slate-500">
        {birdCount} / {totalBirds} oiseaux découverts · {familyCount} / {totalFamilies} familles ·{' '}
        {badgeCount} / {totalBadges} badges
      </p>
    </div>
  )
}
