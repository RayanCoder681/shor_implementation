import { VALID_PRESETS, PRIME_TRAP_PRESET } from '../types/shor';
import type { NumberAnalysis } from '../types/shor';
import { formatFactors, suggestValidN } from '../shor/math';

interface NumberSelectorProps {
  n: number;
  input: string;
  analysis: NumberAnalysis;
  onInputChange: (value: string) => void;
  onSelectN: (n: number) => void;
}

const PRESET_LABELS: Record<number, string> = {
  15: '3×5',
  21: '3×7',
  35: '5×7',
  77: '7×11',
  143: '11×13',
  17: 'Premier',
};

export function NumberSelector({
  n,
  input,
  analysis,
  onInputChange,
  onSelectN,
}: NumberSelectorProps) {
  const suggested = suggestValidN(Number.isFinite(n) ? n : 15);

  return (
    <section className="rounded-2xl border border-[#163028] bg-[#0A1713]/90 p-4 backdrop-blur-md">
      <header className="mb-3">
        <p className="text-xs font-medium uppercase tracking-wider text-emerald-400">
          Classique · CPU
        </p>
        <h2 className="text-lg font-semibold text-white">
          Entier à factoriser{' '}
          <span className="font-mono text-white">N</span>
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Shor factorise un semi-premier impair{' '}
          <span className="font-mono">N = p × q</span> en cherchant la période
          de <span className="font-mono">f(x) = a^x mod N</span>.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {VALID_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onSelectN(preset)}
            className={`rounded-lg border px-3 py-1.5 font-mono text-sm transition ${
              n === preset
                ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300'
                : 'border-[#163028] bg-[#040B09] text-slate-300 hover:border-emerald-400/40'
            }`}
          >
            {preset}
            <span className="ml-1 text-[11px] text-slate-400">
              {PRESET_LABELS[preset]}
            </span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => onSelectN(PRIME_TRAP_PRESET)}
          className={`rounded-lg border px-3 py-1.5 font-mono text-sm transition ${
            n === PRIME_TRAP_PRESET
              ? 'border-amber-400/50 bg-amber-500/10 text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.12)]'
              : 'border-[#163028] bg-[#040B09] text-slate-300 hover:border-amber-400/50'
          }`}
        >
          17
          <span className="ml-1 text-[11px] text-amber-400/80">
            {PRESET_LABELS[17]}
          </span>
        </button>
      </div>

      <label className="mt-4 block">
        <span className="text-xs tracking-wide text-slate-400">
          Saisie libre (4 – 10 000)
        </span>
        <input
          type="number"
          min={4}
          max={10000}
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          className="mt-1 w-full rounded-lg border border-[#163028] bg-[#040B09] px-3 py-2 font-mono text-white outline-none ring-emerald-400/40 focus:ring-2"
        />
      </label>

      {!analysis.valid && (
        <div className="mt-4 rounded-xl border border-amber-400/50 bg-amber-500/10 p-3">
          <p className="text-sm font-semibold text-amber-300">{analysis.title}</p>
          <p className="mt-1 text-sm text-slate-400">{analysis.message}</p>
          {analysis.factors.length > 0 && analysis.kind !== 'prime' && (
            <p className="mt-2 font-mono text-xs text-amber-300">
              Décomposition : {n} = {formatFactors(analysis.factors)}
            </p>
          )}
          <button
            type="button"
            onClick={() => onSelectN(suggested)}
            className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-300 ring-1 ring-emerald-400/40 hover:bg-emerald-500/20"
          >
            Basculer vers N = {suggested} (semi-premier valide)
          </button>
        </div>
      )}

      {analysis.valid && analysis.p !== null && analysis.q !== null && (
        <p className="mt-3 font-mono text-sm text-white">
          N = {analysis.n} = {analysis.p} × {analysis.q}{' '}
          <span className="text-slate-400">(cible pédagogique)</span>
        </p>
      )}
    </section>
  );
}
