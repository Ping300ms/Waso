import type { BadgeState } from '../../domain/badges'
import { BadgeCard } from './BadgeCard'

interface BadgeGridProps {
  badges: BadgeState[]
  onSelectBadge?: (badge: BadgeState) => void
}

export function BadgeGrid({ badges, onSelectBadge }: BadgeGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4">
      {badges.map((badge) => (
        <BadgeCard
          key={badge.id}
          badge={badge}
          onClick={onSelectBadge ? () => onSelectBadge(badge) : undefined}
        />
      ))}
    </div>
  )
}
