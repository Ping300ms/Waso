import { useMemo, useState } from 'react'
import { ALL_BIRDS, type Bird } from '../../data/birds'

interface BirdPickerProps {
  value: Bird | null
  onChange: (bird: Bird) => void
}

export function BirdPicker({ value, onChange }: BirdPickerProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ALL_BIRDS.slice(0, 30)
    return ALL_BIRDS.filter(
      (b) =>
        b.frenchName.toLowerCase().includes(q) || b.scientificName.toLowerCase().includes(q)
    ).slice(0, 30)
  }, [query])

  return (
    <div className="relative">
      <input
        type="text"
        value={value ? value.frenchName : query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder="Rechercher un oiseau..."
        className="w-full border rounded px-3 py-2 dark:bg-slate-900 dark:border-slate-700"
      />
      {open && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded border bg-white dark:bg-slate-900 dark:border-slate-700 shadow-lg">
          {results.length === 0 && (
            <li className="px-3 py-2 text-sm text-slate-400">Aucun résultat</li>
          )}
          {results.map((bird) => (
            <li key={bird.id}>
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-violet-50 dark:hover:bg-violet-950"
                onClick={() => {
                  onChange(bird)
                  setQuery('')
                  setOpen(false)
                }}
              >
                <span className="font-medium">{bird.frenchName}</span>{' '}
                <span className="text-slate-400 italic">{bird.scientificName}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
