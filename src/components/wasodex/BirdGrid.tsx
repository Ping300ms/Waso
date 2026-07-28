import type { Bird } from '../../data/birds'
import { BirdCard } from './BirdCard'

interface BirdGridProps {
  birds: Bird[]
  caughtIds: Set<string>
  datesByBirdId?: Map<string, string>
  onSelectBird?: (bird: Bird) => void
}

export function BirdGrid({ birds, caughtIds, datesByBirdId, onSelectBird }: BirdGridProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 p-4">
      {birds.map((bird) => (
        <BirdCard
          key={bird.id}
          bird={bird}
          caught={caughtIds.has(bird.id)}
          firstSeenDate={datesByBirdId?.get(bird.id)}
          onClick={onSelectBird ? () => onSelectBird(bird) : undefined}
        />
      ))}
    </div>
  )
}
