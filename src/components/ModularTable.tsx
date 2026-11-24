import type { ModularTerm, ShorSimulation } from '../types/shor';

interface ModularTableProps {
  simulation: ShorSimulation;
  hoveredX: number | null;
  onHoverX: (x: number | null) => void;
}

/** Deux teintes vertes alternées : un cycle sur deux a sa propre couleur. */
const CYCLE_STYLES = [
  {
    head: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300',
    cell: 'bg-emerald-500/10',
  },
  {
    head: 'border-teal-300/40 bg-teal-400/10 text-teal-200',
    cell: 'bg-teal-400/10',
  },
] as const;

interface CycleGroup {
  cycle: number;
  from: number;
  span: number;
}

function groupByCycle(terms: ModularTerm[]): CycleGroup[] {
  const groups: CycleGroup[] = [];
  for (const term of terms) {
    const last = groups[groups.length - 1];
    if (last && last.cycle === term.cycle) {
      last.span += 1;
    } else {
      groups.push({ cycle: term.cycle, from: term.x, span: 1 });
    }
  }
  return groups;
}

export function ModularTable({
  simulation,
  hoveredX,
  onHoverX,
}: ModularTableProps) {
  const { terms, order, a, n } = simulation;
  const groups = order === null ? [] : groupByCycle(terms);
  const periodVisible = order !== null && order <= terms.length - 1;

  return (
    <section className="rounded-2xl border border-[#163028] bg-[#0A1713]/90 p-4 backdrop-blur-md">
      <header className="mb-3">
        <h2 className="text-lg font-semibold text-white">
          Tableau modulaire{' '}
          <span className="font-mono text-amber-300">
            f(x) = {a}^x mod {n}
          </span>
        </h2>
        <p className="text-sm text-slate-400">
          Premiers termes seulement (au plus 16), colorés par cycle de longueur
          r. L’or marque <span className="font-mono">a^0 ≡ a^r ≡ 1 (mod N)</span>{' '}
          et les multiples de r.
        </p>
      </header>

      {terms.length === 0 ? (
        <p className="text-sm text-slate-400">Aucune valeur à afficher.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[28rem] border-separate border-spacing-y-1 text-center font-mono text-sm">
            <thead>
              {groups.length > 0 && (
                <tr>
                  <th />
                  {groups.map((group) => {
                    const style = CYCLE_STYLES[group.cycle % 2];
                    const last = group.from + group.span - 1;
                    return (
                      <th
                        key={group.cycle}
                        colSpan={group.span}
                        className={`rounded-md border px-1 py-1 text-[11px] font-medium ${style.head}`}
                      >
                        cycle {group.cycle + 1} · x = {group.from}
                        {group.span > 1 ? `…${last}` : ''}
                      </th>
                    );
                  })}
                </tr>
              )}
              <tr className="text-slate-400">
                <th className="px-2 py-1 text-left font-medium">x</th>
                {terms.map((term) => (
                  <th
                    key={term.x}
                    className={`px-2 py-1 ${
                      term.isPeriodBoundary ? 'text-amber-300' : 'text-white'
                    }`}
                  >
                    {term.x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th className="px-2 py-1 text-left font-medium text-slate-400">
                  a^x mod N
                </th>
                {terms.map((term) => {
                  const gold = term.isUnity || term.isPeriodBoundary;
                  const hovered = hoveredX === term.x;
                  const style = CYCLE_STYLES[term.cycle % 2];
                  return (
                    <td key={term.x} className="px-1">
                      <span
                        onMouseEnter={() => onHoverX(term.x)}
                        onMouseLeave={() => onHoverX(null)}
                        className={`inline-flex min-w-[2.25rem] cursor-default justify-center rounded-md px-1.5 py-1 font-mono ${
                          hovered
                            ? 'bg-amber-500/20 text-white ring-1 ring-white'
                            : gold
                              ? 'bg-amber-500/10 text-amber-300 ring-1 ring-amber-400/40'
                              : `${style.cell} text-white`
                        }`}
                      >
                        {term.value}
                      </span>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {order !== null && (
        <p className="mt-3 font-mono text-xs text-amber-300">
          r = {order}
          {periodVisible
            ? ` · a^0 ≡ a^${order} ≡ 1 (mod ${n}) : la suite se répète`
            : ` · la période dépasse l’échantillon affiché (c’est précisément ce que la QFT† évite d’énumérer)`}
        </p>
      )}
    </section>
  );
}
