import type { GcdStep, ShorSimulation, ShorStepId } from '../types/shor';
import { formatFactors } from '../shor/math';

interface StepCardProps {
  step: ShorStepId;
  simulation: ShorSimulation;
}

function EuclidList({ steps }: { steps: GcdStep[] }) {
  if (steps.length === 0) {
    return <p className="font-mono text-sm text-slate-400">PGCD immédiat.</p>;
  }
  return (
    <ol className="space-y-1 font-mono text-sm text-slate-300">
      {steps.map((s, i) => (
        <li key={`${s.a}-${s.b}-${i}`}>
          {s.a} = {s.b} × {s.quotient} + {s.remainder}
          {s.remainder === 0 ? '  →  arrêt' : ''}
        </li>
      ))}
      <li className="text-emerald-300">
        PGCD = {steps[steps.length - 1]?.b ?? '—'}
      </li>
    </ol>
  );
}

export function StepCard({ step, simulation }: StepCardProps) {
  const {
    n,
    a,
    analysis,
    gcdAN,
    gcdANSteps,
    order,
    halfPower,
    outcome,
    euclidMinus,
    euclidPlus,
    factors,
    explanation,
  } = simulation;

  return (
    <section className="rounded-2xl border border-[#163028] bg-[#0A1713]/90 p-4 backdrop-blur-md">
      <p className="text-xs font-medium uppercase tracking-wider text-amber-300">
        Étape {step} / 4
      </p>

      {step === 1 && (
        <div className="mt-2 space-y-2">
          <h2 className="text-lg font-semibold text-white">
            Validation de N
          </h2>
          <p className="text-sm text-slate-400">{analysis.message}</p>
          {analysis.factors.length > 0 && (
            <p className="font-mono text-sm text-white">
              {n} = {formatFactors(analysis.factors)}
            </p>
          )}
          <p className="text-sm text-slate-400">
            L’algorithme de Shor ne casse pas N par force brute. Il réduit la
            factorisation à un problème de période : si{' '}
            <span className="font-mono">f(x) = a^x mod N</span> a pour plus
            petit <span className="font-mono">r &gt; 0</span> tel que{' '}
            <span className="font-mono">a^r ≡ 1 (mod N)</span>, et si r est
            pair avec <span className="font-mono">a^(r/2) ≢ −1 (mod N)</span>,
            alors les <span className="font-mono">PGCD(a^(r/2) ± 1, N)</span>{' '}
            livrent p et q.
          </p>
        </div>
      )}

      {step === 2 && (
        <div className="mt-2 space-y-2">
          <h2 className="text-lg font-semibold text-white">
            Coprimalité de a et N
          </h2>
          <p className="text-sm text-slate-400">
            On calcule PGCD({a}, {n}) par l’algorithme d’Euclide. Si le résultat
            est 1, a est une base licite pour l’oracle quantique. Sinon on a
            déjà un facteur.
          </p>
          <EuclidList steps={gcdANSteps} />
          <p className="font-mono text-sm text-white">PGCD(a, N) = {gcdAN}</p>
          {outcome === 'trivial-factor' && factors && (
            <p className="text-sm text-emerald-300">
              Factorisation immédiate : N = {factors[0]} × {factors[1]}.
            </p>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="mt-2 space-y-2">
          <h2 className="text-lg font-semibold text-white">
            Recherche de période : classique vs QFT
          </h2>
          <p className="text-sm text-slate-400">
            Classiquement, il faudrait évaluer f(x) jusqu’à voir revenir 1,
            ce qui coûte O(r) exponentiations — r peut être aussi grand que
            N. Quantiquement, on prépare une superposition, on applique
            l’oracle U_a, puis QFT† : la mesure révèle r (ou un multiple)
            sans énumérer tout le cycle. Ici, r est calculé proprement en
            TypeScript et présenté comme le résultat de cette routine.
          </p>
          {order === null ? (
            <p className="text-sm text-amber-200">
              {outcome === 'trivial-factor'
                ? 'Pas de recherche de période : le PGCD a déjà factorisé N.'
                : explanation}
            </p>
          ) : (
            <p className="font-mono text-base text-amber-300">
              r = {order}
              <span className="ml-2 text-sm text-slate-400">
                (ordre de {a} modulo {n})
              </span>
            </p>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="mt-2 space-y-3">
          <h2 className="text-lg font-semibold text-white">
            Post-traitement classique
          </h2>
          {outcome === 'odd-period' && (
            <p className="text-sm text-rose-200">{explanation}</p>
          )}
          {outcome === 'minus-one' && (
            <p className="text-sm text-rose-200">
              {explanation} Vérification : {a}^{order ? order / 2 : '?'} ≡{' '}
              {halfPower} ≡ −1 (mod {n}).
            </p>
          )}
          {outcome === 'trivial-factor' && (
            <p className="text-sm text-slate-300">
              Étape inutile : la factorisation a eu lieu dès le PGCD(a, N).
            </p>
          )}
          {outcome === 'invalid-n' && (
            <p className="text-sm text-amber-200">
              Choisissez d’abord un N semi-premier valide.
            </p>
          )}
          {order !== null && outcome !== 'odd-period' && outcome !== 'minus-one' && outcome !== 'trivial-factor' && outcome !== 'invalid-n' && (
            <ul className="space-y-1 text-sm text-slate-400">
              <li>
                r = <span className="font-mono text-amber-300">{order}</span>{' '}
                {order % 2 === 0 ? 'est pair ✓' : 'est impair ✗'}
              </li>
              {halfPower !== null && (
                <li>
                  <span className="font-mono">
                    a^(r/2) ≡ {halfPower} (mod {n})
                  </span>{' '}
                  {halfPower === n - 1
                    ? '≡ −1 → échec'
                    : '≢ −1 ✓'}
                </li>
              )}
            </ul>
          )}
          {(outcome === 'success' || outcome === 'order-missing') &&
            order !== null &&
            halfPower !== null && (
              <>
                {euclidMinus && (
                  <div>
                    <p className="text-xs tracking-wide text-emerald-400">
                      PGCD({euclidMinus.label}, N) avec résidu {euclidMinus.residue}
                    </p>
                    <EuclidList steps={euclidMinus.steps} />
                  </div>
                )}
                {euclidPlus && (
                  <div>
                    <p className="text-xs tracking-wide text-emerald-400">
                      PGCD({euclidPlus.label}, N) avec résidu {euclidPlus.residue}
                    </p>
                    <EuclidList steps={euclidPlus.steps} />
                  </div>
                )}
                {factors && outcome === 'success' && (
                  <p className="rounded-lg bg-emerald-500/10 px-3 py-2 font-mono text-white ring-1 ring-emerald-400/40">
                    N = {factors[0]} × {factors[1]}
                  </p>
                )}
              </>
            )}
        </div>
      )}
    </section>
  );
}
