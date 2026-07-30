import { useState } from "react";
import {
  useBirdRecognizer,
  type Detection,
} from "../birdnet/useBirdRecognizer";
import { SpectrogramCanvas } from "../components/reconnaissance/SpectrogramCanvas";
import { DetectedBirdRow } from "../components/reconnaissance/DetectedBirdRow";
import { CatchAnimation } from "../components/wasodex/CatchAnimation";
import { upsertSighting } from "../db/sightingsRepo";
import type { Bird } from "../data/birds";

export function Reconnaissance() {
  const { status, progress, errorMessage, detections, analyser, start, stop } =
    useBirdRecognizer();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [celebrating, setCelebrating] = useState<Bird | null>(null);

  async function handleQuickAdd(detection: Detection) {
    await upsertSighting(detection.bird.id, new Date());
    setAddedIds((prev) => new Set(prev).add(detection.bird.id));
    setCelebrating(detection.bird);
  }

  async function test() {
    console.log("test");
    void start();
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Reconnaissance au chant</h2>
        {status === "listening" ? (
          <button
            type="button"
            onClick={stop}
            className="px-3 py-1.5 text-sm rounded bg-red-600 text-white"
          >
            Arrêter
          </button>
        ) : (
          <button
            type="button"
            onClick={() => test()}
            disabled={status === "downloading"}
            className="px-3 py-1.5 text-sm rounded bg-violet-600 text-white disabled:opacity-50"
          >
            Démarrer l'écoute
          </button>
        )}
      </div>

      {status === "downloading" && (
        <div className="space-y-1">
          <p className="text-sm text-slate-500">
            Chargement du modèle ({progress}%)...
          </p>
          <div className="h-1.5 w-full rounded-full bg-slate-300 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full bg-violet-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {status === "error" && (
        <p className="text-sm text-red-600">
          {errorMessage ?? "Une erreur est survenue."}
        </p>
      )}

      {status === "listening" && <SpectrogramCanvas analyser={analyser} />}

      {status === "listening" && detections.length === 0 && (
        <p className="text-sm text-slate-500">
          En écoute... aucun chant reconnu pour l'instant.
        </p>
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

      {celebrating && (
        <CatchAnimation
          bird={celebrating}
          onDone={() => setCelebrating(null)}
        />
      )}
    </div>
  );
}
