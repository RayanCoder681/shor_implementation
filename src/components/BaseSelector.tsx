import type { ShorSimulation } from '../types/shor';

interface BaseSelectorProps {
  n: number;
  a: number;
  coprimeList: number[];
  simulation: ShorSimulation;
  disabled: boolean;
  onSelectA: (a: number) => void;
  onRandomA: () => void;
  onSuccessfulA: () => void;
}

export function BaseSelector({
  n,
  a,
  coprimeList,
  simulation,
  disabled,
  onSelectA,
  onRandomA,
  onSuccessfulA,
}: BaseSelectorProps) {
  const suggestions = coprimeList.slice(0, 12);
  const selectable = coprimeList.length <= 250 ? coprimeList : suggestions;
  const fail =
    simulation.outcome === 'odd-period' ||
    simulation.outcome === 'minus-one';
  const trivial = simulation.outcome === 'trivial-factor';

  return (
    <section
      className={`rounded-2xl border border-[#163028] bg-[#0A1713]/90 p-4 backdrop-blur-md ${
        disabled ? 'opacity-50' : ''
      }`}
    >
      <header className="mb-3">
        <p className="text-xs font-medium uppercase tracking-wider text-emerald-400">
          Classique · CPU
        </p>
        <h2 className="text-lg font-semibold text-white">
          Base <span className="font-mono text-white">a</span>
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          On tire <span className="font-mono">1 &lt; a &lt; N</span> copremier à{' '}
          <span className="font-mono">N</span> (
          <span className="font-mono">PGCD(a, N) = 1</span>). Sinon la
          factorisation est déjà triviale.
        </p>
      </header>

      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-[10rem] flex-1">
          <span className="text-xs tracking-wide text-slate-400">
            Copremiers (1 &lt; a &lt; N)
          </span>
          <select
            value={selectable.includes(a) ? String(a) : ''}
            disabled={disabled || selectable.length === 0}
            onChange={(event) => onSelectA(Number(event.target.value))}
            className="mt-1 w-full rounded-lg border border-[#163028] bg-[#040B09] px-3 py-2 font-mono text-white outline-none ring-emerald-400/40 focus:ring-2 disabled:cursor-not-allowed"
          >
            {!selectable.includes(a) && (
              <option value="">Choisir a</option>
            )}
            {selectable.map((value) => (
              <option key={value} value={value}>
                a = {value}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-[7rem] w-28">
          <span className="text-xs tracking-wide text-slate-400">
            a (entier)
          </span>
          <input
            type="number"
            min={2}
            max={Math.max(2, n - 1)}
            value={Number.isFinite(a) ? a : 2}
            disabled={disabled}
            onChange={(event) => onSelectA(Number(event.target.value))}
            className="mt-1 w-full rounded-lg border border-[#163028] bg-[#040B09] px-3 py-2 font-mono text-white outline-none ring-emerald-400/40 focus:ring-2 disabled:cursor-not-allowed"
          />
        </label>
        <button
          type="button"
          disabled={disabled || coprimeList.length === 0}
          onClick={onRandomA}
          className="rounded-lg border border-amber-400/50 bg-amber-500/10 px-3 py-2 text-sm text-amber-300 hover:bg-amber-500/20 disabled:cursor-not-allowed"
        >
          Tirer a au hasard
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {suggestions.map((value) => (
          <button
            key={value}
            type="button"
            disabled={disabled}
            onClick={() => onSelectA(value)}
            className={`rounded-md px-2 py-1 font-mono text-xs ring-1 transition ${
              a === value
                ? 'bg-emerald-500/10 text-emerald-300 ring-emerald-400/40'
                : 'bg-[#040B09] text-slate-300 ring-[#163028] hover:ring-emerald-400/40'
            }`}
          >
            {value}
          </button>
        ))}
        {coprimeList.length > suggestions.length && (
          <span className="self-center text-xs text-slate-400">
            +{coprimeList.length - suggestions.length} copremiers
          </span>
        )}
      </div>

      {trivial && simulation.factors && (
        <div className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3">
          <p className="text-sm font-semibold text-emerald-200">
            Factorisation triviale
          </p>
          <p className="mt-1 text-sm text-emerald-100/80">
            {simulation.explanation}
          </p>
        </div>
      )}

      {simulation.outcome === 'order-missing' && !disabled && (
        <div className="mt-4 rounded-xl border border-amber-400/50 bg-amber-500/10 p-3">
          <p className="text-sm font-semibold text-amber-300">
            Base inutilisable
          </p>
          <p className="mt-1 text-sm text-slate-400">{simulation.explanation}</p>
          <button
            type="button"
            onClick={onSuccessfulA}
            className="mt-3 rounded-lg bg-amber-500/10 px-3 py-1.5 text-sm font-medium text-amber-300 ring-1 ring-amber-400/50 hover:bg-amber-500/20"
          >
            Tester un autre a valide
          </button>
        </div>
      )}

      {fail && (
        <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3">
          <p className="text-sm font-semibold text-rose-200">
            {simulation.outcome === 'odd-period'
              ? `Période impaire r = ${simulation.order}`
              : `a^(r/2) ≡ −1 (mod N)`}
          </p>
          <p className="mt-1 text-sm text-rose-100/80">{simulation.explanation}</p>
          <button
            type="button"
            onClick={onSuccessfulA}
            className="mt-3 rounded-lg bg-amber-500/10 px-3 py-1.5 text-sm font-medium text-amber-300 ring-1 ring-amber-400/50 hover:bg-amber-500/20"
          >
            Tester un autre a valide
          </button>
        </div>
      )}
    </section>
  );
}
