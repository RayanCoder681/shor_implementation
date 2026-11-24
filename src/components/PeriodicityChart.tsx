import { useMemo, useState } from 'react';
import type { ShorSimulation } from '../types/shor';

interface PeriodicityChartProps {
  simulation: ShorSimulation;
  hoveredX: number | null;
  onHoverX: (x: number | null) => void;
}

interface HoverState {
  x: number;
  value: number;
  clientX: number;
  clientY: number;
}

export function PeriodicityChart({
  simulation,
  hoveredX,
  onHoverX,
}: PeriodicityChartProps) {
  const { terms, order, a, n } = simulation;
  const [hover, setHover] = useState<HoverState | null>(null);

  const layout = useMemo(() => {
    const width = 720;
    const height = 260;
    const padL = 44;
    const padR = 16;
    const padT = 28;
    const padB = 36;
    const innerW = width - padL - padR;
    const innerH = height - padT - padB;
    const maxY = Math.max(n - 1, 1);
    const count = Math.max(terms.length, 1);
    const slot = innerW / count;
    return { width, height, padL, padR, padT, padB, innerW, innerH, maxY, slot };
  }, [n, terms.length]);

  const yScale = (value: number): number => {
    return layout.padT + layout.innerH * (1 - value / layout.maxY);
  };

  const boundaries: number[] = [];
  if (order !== null) {
    for (let k = 0; k * order <= Math.max(terms.length - 1, 0); k += 1) {
      boundaries.push(k * order);
    }
  }

  return (
    <section className="relative rounded-2xl border border-[#163028] bg-[#0A1713]/90 p-4 backdrop-blur-md">
      <header className="mb-3">
        <h2 className="text-lg font-semibold text-white">
          Graphique de périodicité
        </h2>
        <p className="text-sm text-slate-400">
          Barres émeraude de <span className="font-mono">f(x)</span>. L’or et
          les pointillés marquent les multiples de r (QFT†) et{' '}
          <span className="font-mono">a^x ≡ 1</span>.
        </p>
      </header>

      {terms.length === 0 ? (
        <p className="text-sm text-slate-400">Aucun échantillon à tracer.</p>
      ) : (
        <svg
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          className="h-auto w-full"
          role="img"
          aria-label="Graphique discret de a puissance x modulo N"
          onMouseLeave={() => {
            setHover(null);
            onHoverX(null);
          }}
        >
          <defs>
            <linearGradient id="barEmerald" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
            <linearGradient id="barGold" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#FBBF24" />
            </linearGradient>
          </defs>
          <rect width={layout.width} height={layout.height} rx="12" fill="#040B09" />

          <line
            x1={layout.padL}
            y1={layout.padT}
            x2={layout.padL}
            y2={layout.padT + layout.innerH}
            stroke="#163028"
          />
          <line
            x1={layout.padL}
            y1={layout.padT + layout.innerH}
            x2={layout.padL + layout.innerW}
            y2={layout.padT + layout.innerH}
            stroke="#163028"
          />
          <text x="8" y={layout.padT + 10} fill="#94a3b8" fontSize="11">
            N-1
          </text>
          <text
            x="8"
            y={layout.padT + layout.innerH}
            fill="#94a3b8"
            fontSize="11"
          >
            0
          </text>

          {boundaries.map((bx) => {
            const cx = layout.padL + (bx + 0.5) * layout.slot;
            return (
              <g key={bx}>
                <line
                  x1={cx}
                  y1={layout.padT}
                  x2={cx}
                  y2={layout.padT + layout.innerH}
                  stroke="#FBBF24"
                  strokeDasharray="4 4"
                  strokeOpacity="0.8"
                />
                <text
                  x={cx}
                  y={layout.padT - 10}
                  textAnchor="middle"
                  fill="#FBBF24"
                  fontSize="11"
                  fontFamily="ui-monospace, monospace"
                >
                  {bx === 0 ? 'x = 0' : `x = ${bx / (order ?? 1)}r`}
                </text>
              </g>
            );
          })}

          {terms.map((term, index) => {
            const barW = Math.max(layout.slot * 0.62, 4);
            const x = layout.padL + index * layout.slot + (layout.slot - barW) / 2;
            const y = yScale(term.value);
            const h = layout.padT + layout.innerH - y;
            const gold = term.isUnity || term.isPeriodBoundary;
            const hovered = hoveredX === term.x;
            const slotX = layout.padL + index * layout.slot;
            const show = (clientX: number, clientY: number): void => {
              onHoverX(term.x);
              setHover({ x: term.x, value: term.value, clientX, clientY });
            };
            return (
              <g key={term.x}>
                {hovered && (
                  <rect
                    x={slotX}
                    y={layout.padT}
                    width={layout.slot}
                    height={layout.innerH}
                    rx="4"
                    fill="#FBBF24"
                    fillOpacity="0.1"
                  />
                )}
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={Math.max(h, 2)}
                  rx="3"
                  fill={gold ? 'url(#barGold)' : 'url(#barEmerald)'}
                  stroke={hovered ? '#FFFFFF' : 'transparent'}
                  strokeWidth={hovered ? 2 : 0}
                />
                <rect
                  x={slotX}
                  y={layout.padT}
                  width={layout.slot}
                  height={layout.innerH}
                  fill="transparent"
                  onMouseEnter={(event) => show(event.clientX, event.clientY)}
                  onMouseMove={(event) => show(event.clientX, event.clientY)}
                />
                <text
                  x={x + barW / 2}
                  y={layout.padT + layout.innerH + 14}
                  textAnchor="middle"
                  fill={gold ? '#FBBF24' : '#94a3b8'}
                  fontSize="11"
                  fontFamily="ui-monospace, monospace"
                >
                  {term.x}
                </text>
              </g>
            );
          })}
        </svg>
      )}

      {hover && (
        <div
          className="pointer-events-none fixed z-20 whitespace-nowrap rounded-lg border border-[#163028] bg-[#0A1713] px-2.5 py-1.5 font-mono text-xs text-white shadow-[0_0_20px_rgba(251,191,36,0.12)]"
          style={{ left: hover.clientX + 12, top: hover.clientY + 12 }}
        >
          x = {hover.x}
          <br />
          {a}^{hover.x} mod {n} = {hover.value}
        </div>
      )}
    </section>
  );
}
