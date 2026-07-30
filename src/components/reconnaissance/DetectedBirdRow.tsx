import type { Detection } from '../../birdnet/useBirdRecognizer'
import { emojiForFamily } from '../../domain/emoji'
import { RARETE_STYLE } from '../../domain/rarete'

interface DetectedBirdRowProps {
  detection: Detection
  onQuickAdd: (detection: Detection) => void
  added: boolean
}

export function DetectedBirdRow({ detection, onQuickAdd, added }: DetectedBirdRowProps) {
  const { bird, confidence } = detection
  const style = RARETE_STYLE[bird.rarete]

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border-2 p-3 ${style.cardBg} ${style.cardBorder}`}
    >
      <span className="text-2xl" aria-hidden>
        {emojiForFamily(bird.famille)}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate ${style.textColor}`}>{bird.frenchName}</p>
        <p className="text-xs text-slate-500">Confiance {Math.round(confidence * 100)}%</p>
      </div>
      <button
        type="button"
        disabled={added}
        onClick={() => onQuickAdd(detection)}
        className="shrink-0 px-3 py-1.5 text-sm rounded bg-violet-600 text-white disabled:opacity-50"
      >
        {added ? '✓ Ajouté' : '+ Ajouter'}
      </button>
    </div>
  )
}
