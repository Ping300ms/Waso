interface AddSightingCardProps {
  onClick: () => void;
}

export function AddSightingCard({ onClick }: AddSightingCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Ajouter un oiseau observé"
      className="aspect-square rounded-xl border-2 border-dashed border-violet-300 dark:border-violet-700 flex items-center justify-center text-violet-500 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950 transition"
    >
      <span className="text-3xl leading-none" aria-hidden>
        +
      </span>
    </button>
  );
}
