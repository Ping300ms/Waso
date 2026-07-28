import { useEffect } from 'react'
import type { Bird } from '../../data/birds'
import { RARETE_ANIMATION, RARETE_STYLE } from '../../domain/rarete'
import { emojiForFamily } from '../../domain/emoji'

interface CatchAnimationProps {
  bird: Bird
  onDone: () => void
}

export function CatchAnimation({ bird, onDone }: CatchAnimationProps) {
  const spec = RARETE_ANIMATION[bird.rarete]
  const style = RARETE_STYLE[bird.rarete]

  useEffect(() => {
    const timer = setTimeout(onDone, spec.durationMs)
    return () => clearTimeout(timer)
  }, [spec.durationMs, onDone])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        className={`${spec.className} rounded-2xl border-4 p-8 flex flex-col items-center gap-3 ${style.cardBg} ${style.cardBorder}`}
      >
        {spec.confetti && <div className="text-4xl" aria-hidden>🎉✨🎊</div>}
        <span className="text-6xl" aria-hidden>
          {emojiForFamily(bird.famille)}
        </span>
        <p className={`font-bold text-lg ${style.textColor}`}>{bird.frenchName}</p>
        <p className={`text-sm ${style.textColor}`}>{style.label} découvert !</p>
      </div>
    </div>
  )
}
