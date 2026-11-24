import { SHOR_STEPS } from '../types/shor';
import type { PlaybackSpeed, ShorStepId } from '../types/shor';

interface StepPlayerProps {
  step: ShorStepId;
  playing: boolean;
  speed: PlaybackSpeed;
  onStep: (step: ShorStepId) => void;
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  onReset: () => void;
  onSpeed: (speed: PlaybackSpeed) => void;
}

const SPEEDS: PlaybackSpeed[] = [0.5, 1, 2];

export function StepPlayer({
  step,
  playing,
  speed,
  onStep,
  onPrev,
  onNext,
  onTogglePlay,
  onReset,
  onSpeed,
}: StepPlayerProps) {
  return (
    <section className="rounded-2xl border border-[#163028] bg-[#0A1713]/90 p-4 backdrop-blur-md">
      <header className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-white">Lecteur d’étapes</h2>
        <div className="flex gap-1">
          {SPEEDS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onSpeed(value)}
              className={`rounded-md px-2 py-1 font-mono text-xs ring-1 ${
                speed === value
                  ? 'bg-amber-500/10 text-amber-300 ring-amber-400/50'
                  : 'text-slate-400 ring-[#163028] hover:text-white'
              }`}
            >
              {value}x
            </button>
          ))}
        </div>
      </header>

      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {SHOR_STEPS.map((item) => {
          const active = item.id === step;
          const quantum = item.domain === 'quantique';
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onStep(item.id)}
                className={`h-full w-full rounded-xl border p-2 text-left transition ${
                  active
                    ? quantum
                      ? 'border-amber-400/50 bg-amber-500/10 shadow-[0_0_20px_rgba(251,191,36,0.12)]'
                      : 'border-emerald-400/40 bg-emerald-500/10'
                    : 'border-[#163028] bg-[#040B09]/60 hover:border-emerald-400/40'
                }`}
              >
                <span
                  className={`font-mono text-xs ${
                    quantum ? 'text-amber-300' : 'text-emerald-400'
                  }`}
                >
                  {item.id}. {item.domain}
                </span>
                <span className="mt-0.5 block text-sm text-white">
                  {item.title}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={step === 1}
          className="rounded-lg border border-[#163028] px-3 py-1.5 text-sm text-white hover:border-emerald-400/40 disabled:opacity-40"
        >
          Précédent
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={step === 4}
          className="rounded-lg border border-[#163028] px-3 py-1.5 text-sm text-white hover:border-emerald-400/40 disabled:opacity-40"
        >
          Suivant
        </button>
        <button
          type="button"
          onClick={onTogglePlay}
          className="rounded-lg bg-amber-500/10 px-3 py-1.5 text-sm text-amber-300 ring-1 ring-amber-400/50"
        >
          {playing ? 'Pause' : 'Lecture auto'}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-[#163028] px-3 py-1.5 text-sm text-slate-400"
        >
          Réinitialiser
        </button>
      </div>
    </section>
  );
}
