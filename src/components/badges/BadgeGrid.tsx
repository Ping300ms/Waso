import type { BadgeState } from "../../domain/badges";
import { BadgeCard } from "./BadgeCard";

interface BadgeGridProps {
  badges: BadgeState[];
  onSelectBadge?: (badge: BadgeState) => void;
  oneColumn?: boolean;
}

export function BadgeGrid({
  badges,
  onSelectBadge,
  oneColumn = false,
}: BadgeGridProps) {
  return (
    <div
      className={`grid ${oneColumn ? "grid-cols-1" : "grid-cols-2"} sm:grid-cols-3 md:grid-cols-4 gap-3 p-4`}
    >
      {badges.map((badge) => (
        <BadgeCard
          key={badge.id}
          badge={badge}
          onClick={onSelectBadge ? () => onSelectBadge(badge) : undefined}
        />
      ))}
    </div>
  );
}
