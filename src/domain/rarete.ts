import type { Rarete } from '../data/birds'

export const RARETE_ORDER: Rarete[] = ['Commun', 'Rare', 'Epique', 'Legendaire']

export interface RareteStyle {
  cardBg: string
  cardBorder: string
  textColor: string
  label: string
}

export const RARETE_STYLE: Record<Rarete, RareteStyle> = {
  Commun: {
    cardBg: 'bg-slate-100 dark:bg-slate-800',
    cardBorder: 'border-slate-300 dark:border-slate-600',
    textColor: 'text-slate-700 dark:text-slate-200',
    label: 'Commun',
  },
  Rare: {
    cardBg: 'bg-sky-100 dark:bg-sky-900',
    cardBorder: 'border-sky-400 dark:border-sky-500',
    textColor: 'text-sky-800 dark:text-sky-200',
    label: 'Rare',
  },
  Epique: {
    cardBg: 'bg-violet-100 dark:bg-violet-900',
    cardBorder: 'border-violet-400 dark:border-violet-500',
    textColor: 'text-violet-800 dark:text-violet-200',
    label: 'Épique',
  },
  Legendaire: {
    cardBg: 'bg-amber-100 dark:bg-amber-900',
    cardBorder: 'border-amber-400 dark:border-amber-500',
    textColor: 'text-amber-800 dark:text-amber-200',
    label: 'Légendaire',
  },
}

export interface RareteAnimationSpec {
  /** Tailwind animation class(es) applied to the catch celebration overlay. */
  className: string
  /** Total duration in ms the celebration overlay should stay mounted. */
  durationMs: number
  /** Whether to render a confetti/particle burst. */
  confetti: boolean
}

export const RARETE_ANIMATION: Record<Rarete, RareteAnimationSpec> = {
  Commun: { className: 'animate-fade-in', durationMs: 700, confetti: false },
  Rare: { className: 'animate-pop-in', durationMs: 1000, confetti: false },
  Epique: { className: 'animate-pop-in', durationMs: 1400, confetti: true },
  Legendaire: { className: 'animate-pop-in', durationMs: 2200, confetti: true },
}
