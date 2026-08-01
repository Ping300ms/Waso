import { useMemo, useState } from 'react'
import { DEPARTEMENTS, type Departement } from '../../data/departements'

interface DepartmentPickerModalProps {
  onSelect: (departement: Departement) => void
  onClose: () => void
}

export function DepartmentPickerModal({ onSelect, onClose }: DepartmentPickerModalProps) {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return DEPARTEMENTS
    return DEPARTEMENTS.filter(
      (d) => d.nom.toLowerCase().includes(q) || d.code.toLowerCase().includes(q)
    )
  }, [query])

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white dark:bg-slate-900 p-5 space-y-3 max-h-[80vh] flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-bold">Choisir un département</h2>
          <button type="button" onClick={onClose} className="text-slate-400 text-xl leading-none">
            ×
          </button>
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un département..."
          autoFocus
          className="w-full border rounded px-3 py-2 text-sm dark:bg-slate-900 dark:border-slate-700"
        />

        <ul className="overflow-y-auto divide-y divide-slate-200 dark:divide-slate-800">
          {results.length === 0 && (
            <li className="px-1 py-2 text-sm text-slate-400">Aucun résultat</li>
          )}
          {results.map((dept) => (
            <li key={dept.code}>
              <button
                type="button"
                onClick={() => onSelect(dept)}
                className="w-full text-left px-1 py-2 text-sm hover:bg-violet-50 dark:hover:bg-violet-950"
              >
                <span className="text-slate-400">{dept.code}</span> {dept.nom}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
