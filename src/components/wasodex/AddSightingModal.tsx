import { useState } from 'react'
import type { Bird } from '../../data/birds'
import { BirdPicker } from './BirdPicker'
import { upsertSighting } from '../../db/sightingsRepo'

interface AddSightingModalProps {
  onClose: () => void
  onSaved: (bird: Bird) => void
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

export function AddSightingModal({ onClose, onSaved }: AddSightingModalProps) {
  const [bird, setBird] = useState<Bird | null>(null)
  const [date, setDate] = useState(todayIsoDate())
  const [saving, setSaving] = useState(false)

  const canSave = bird !== null && date !== '' && date <= todayIsoDate()

  async function handleSave() {
    if (!bird) return
    setSaving(true)
    await upsertSighting(bird.id, new Date(date))
    setSaving(false)
    onSaved(bird)
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 p-5 space-y-4">
        <h2 className="text-lg font-bold">Ajouter un oiseau découvert</h2>

        <div className="space-y-1">
          <label className="text-sm font-medium">Oiseau</label>
          <BirdPicker value={bird} onChange={setBird} />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Date d'observation</label>
          <input
            type="date"
            value={date}
            max={todayIsoDate()}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border rounded px-3 py-2 dark:bg-slate-900 dark:border-slate-700"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded border border-slate-300 dark:border-slate-700"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={!canSave || saving}
            onClick={handleSave}
            className="px-4 py-2 text-sm rounded bg-violet-600 text-white disabled:opacity-50"
          >
            {saving ? 'Enregistrement...' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  )
}
