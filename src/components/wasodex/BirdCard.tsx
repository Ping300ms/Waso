import type { Bird } from "../../data/birds";
import { RARETE_STYLE } from "../../domain/rarete";
import { emojiForFamily } from "../../domain/emoji";

interface BirdCardProps {
  bird: Bird;
  caught: boolean;
  firstSeenDate?: string;
  onClick?: () => void;
}

export function BirdCard({
  bird,
  caught,
  firstSeenDate,
  onClick,
}: BirdCardProps) {
  const style = RARETE_STYLE[bird.rarete];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center gap-1 p-2 text-center transition
        ${caught ? style.cardBg : ""} ${style.cardBorder}
        ${caught ? "" : "saturate-[0.35] opacity-80"}`}
    >
      <span className="text-3xl" aria-hidden>
        {emojiForFamily(bird.famille)}
      </span>
      <span
        className={`text-[11px] font-medium leading-tight ${style.textColor}`}
      >
        {bird.frenchName}
      </span>
      {caught && firstSeenDate ? (
        <span className="text-[10px] text-slate-500 dark:text-slate-400">
          {firstSeenDate}
        </span>
      ) : (
        <span className="text-[10px] text-slate-400 dark:text-slate-500">
          ???
        </span>
      )}
    </button>
  );
}
