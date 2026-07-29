import { useMemo, useState } from "react";
import { useBadges } from "../hooks/useBadges";
import { BadgeGrid } from "../components/badges/BadgeGrid";
import {
  BadgeFilterBar,
  type BadgeFilter,
} from "../components/badges/BadgeFilterBar";
import { BadgeDetailModal } from "../components/badges/BadgeDetailModal";
import { BadgeCategoryTabs } from "../components/badges/BadgeCategoryTabs";
import type { BadgeCategory, BadgeState } from "../domain/badges";

type TabCategory = Exclude<BadgeCategory, "special">;

export function Badges() {
  const badges = useBadges();
  const [filter, setFilter] = useState<BadgeFilter>("tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<TabCategory>("famille");
  const [selectedBadge, setSelectedBadge] = useState<BadgeState | null>(null);

  const matchesFilters = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return (b: BadgeState) => {
      if (filter === "obtenus" && !b.obtained) return false;
      if (filter === "non-obtenus" && b.obtained) return false;
      if (query && !b.label.toLowerCase().includes(query)) return false;
      return true;
    };
  }, [filter, searchQuery]);

  const specialBadge = badges.find(
    (b) => b.category === "special" && matchesFilters(b),
  );
  const visible = badges.filter(
    (b) => b.category === activeCategory && matchesFilters(b),
  );

  const obtainedCount = badges.filter((b) => b.obtained).length;

  return (
    <div>
      <p className="text-sm text-slate-500 px-4 pt-3">
        {obtainedCount} / {badges.length} badges obtenus
      </p>
      <BadgeFilterBar
        filter={filter}
        onFilterChange={setFilter}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />

      {specialBadge && (
        <div className="px-4 pb-2">
          <BadgeGrid
            badges={[specialBadge]}
            onSelectBadge={setSelectedBadge}
            oneColumn
          />
        </div>
      )}

      <BadgeCategoryTabs
        activeCategory={activeCategory}
        onChange={setActiveCategory}
      />
      <BadgeGrid badges={visible} onSelectBadge={setSelectedBadge} />

      {selectedBadge && (
        <BadgeDetailModal
          badge={selectedBadge}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </div>
  );
}
