import { useEffect, useState } from 'react'
import { IoLocateOutline, IoMic, IoSquare } from 'react-icons/io5'
import { useBirdRecognizer, type Detection } from '../birdnet/useBirdRecognizer'
import { SpectrogramCanvas } from '../components/reconnaissance/SpectrogramCanvas'
import { DetectedBirdRow } from '../components/reconnaissance/DetectedBirdRow'
import { DepartmentPickerModal } from '../components/reconnaissance/DepartmentPickerModal'
import { CatchAnimation } from '../components/wasodex/CatchAnimation'
import { upsertSighting } from '../db/sightingsRepo'
import type { Bird } from '../data/birds'
import type { Departement } from '../data/departements'

const DEPARTMENT_STORAGE_KEY = 'waso-reconnaissance-departement'

export function Reconnaissance() {
  const { status, progress, errorMessage, detections, analyser, start, stop, setLocation } =
    useBirdRecognizer()
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [celebrating, setCelebrating] = useState<Bird | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [departement, setDepartement] = useState<Departement | null>(() => {
    const raw = localStorage.getItem(DEPARTMENT_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Departement) : null
  })

  useEffect(() => {
    if (departement) setLocation(departement.lat, departement.lon)
  }, [departement, setLocation])

  async function handleQuickAdd(detection: Detection) {
    await upsertSighting(detection.bird.id, new Date())
    setAddedIds((prev) => new Set(prev).add(detection.bird.id))
    setCelebrating(detection.bird)
  }

  function handleSelectDepartement(dept: Departement) {
    setDepartement(dept)
    localStorage.setItem(DEPARTMENT_STORAGE_KEY, JSON.stringify(dept))
    setPickerOpen(false)
  }

  return (
    <div className="p-4 pb-28 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-slate-500">
          {departement ? `Localisation : ${departement.nom}` : 'Aucune localisation'}
        </p>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          aria-label="Choisir un département"
          className={`p-2 rounded-lg border ${
            departement
              ? 'border-violet-400 text-violet-600 dark:text-violet-400'
              : 'border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400'
          }`}
        >
          <IoLocateOutline size={20} aria-hidden />
        </button>
      </div>

      {pickerOpen && (
        <DepartmentPickerModal
          onSelect={handleSelectDepartement}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {status === 'downloading' && (
        <div className="space-y-1">
          <p className="text-sm text-slate-500">Chargement du modèle ({progress}%)...</p>
          <div className="h-1.5 w-full rounded-full bg-slate-300 dark:bg-slate-700 overflow-hidden">
            <div className="h-full bg-violet-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {status === 'error' && (
        <p className="text-sm text-red-600">{errorMessage ?? 'Une erreur est survenue.'}</p>
      )}

      {status === 'listening' && <SpectrogramCanvas analyser={analyser} />}

      {status === 'listening' && detections.length === 0 && (
        <p className="text-sm text-slate-500">En écoute... aucun chant reconnu pour l'instant.</p>
      )}

      <div className="space-y-2">
        {detections.map((detection) => (
          <DetectedBirdRow
            key={detection.bird.id}
            detection={detection}
            onQuickAdd={handleQuickAdd}
            added={addedIds.has(detection.bird.id)}
          />
        ))}
      </div>

      {celebrating && <CatchAnimation bird={celebrating} onDone={() => setCelebrating(null)} />}

      <button
        type="button"
        onClick={() => (status === 'listening' ? stop() : void start())}
        disabled={status === 'downloading'}
        aria-label={status === 'listening' ? "Arrêter l'écoute" : "Démarrer l'écoute"}
        className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-30 w-16 h-16 rounded-full flex items-center justify-center shadow-lg text-white disabled:opacity-50 ${
          status === 'listening' ? 'bg-red-600' : 'bg-violet-600'
        }`}
      >
        {status === 'listening' ? <IoSquare size={26} /> : <IoMic size={28} />}
      </button>
    </div>
  )
}
