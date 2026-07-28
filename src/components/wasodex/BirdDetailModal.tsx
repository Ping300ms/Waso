import type { Bird } from '../../data/birds'
import { RARETE_STYLE } from '../../domain/rarete'
import { emojiForFamily } from '../../domain/emoji'

interface BirdDetailModalProps {
  bird: Bird
  firstSeenDate?: string
  onClose: () => void
}

export function BirdDetailModal({ bird, firstSeenDate, onClose }: BirdDetailModalProps) {
  const style = RARETE_STYLE[bird.rarete]

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white dark:bg-slate-900 p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <span className="text-5xl" aria-hidden>
            {emojiForFamily(bird.famille)}
          </span>
          <button type="button" onClick={onClose} className="text-slate-400 text-xl leading-none">
            ×
          </button>
        </div>

        <div>
          <h2 className="text-lg font-bold">{bird.frenchName}</h2>
          <p className="text-sm italic text-slate-500">{bird.scientificName}</p>
        </div>

        <span
          className={`inline-block text-xs font-medium px-2 py-1 rounded-full border ${style.cardBg} ${style.cardBorder} ${style.textColor}`}
        >
          {style.label}
        </span>

        <p className="text-sm text-slate-500">
          {firstSeenDate ? `Découvert le ${firstSeenDate}` : 'Pas encore observé'}
        </p>
      </div>
    </div>
  )
}
