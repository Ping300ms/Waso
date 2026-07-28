import type { BadgeState } from '../../domain/badges'
import { BadgeCard } from './BadgeCard'

export function BadgeGrid({ badges }: { badges: BadgeState[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4">
      {badges.map((badge) => (
        <BadgeCard key={badge.id} badge={badge} />
      ))}
    </div>
  )
}
