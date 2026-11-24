import type { ShorStepId } from '../types/shor';

interface HybridArchitectureDiagramProps {
  step: ShorStepId;
}

type Side = 'classique' | 'quantique';

interface BlockDef {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub: string;
  side: Side;
  activeOn: ShorStepId[];
}

interface LaneDef {
  id: string;
  x: number;
  w: number;
  title: string;
  side: Side;
  activeOn: ShorStepId[];
}

const VIEW_W = 1000;
const VIEW_H = 236;

const LANES: LaneDef[] = [
  {
    id: 'cpu-pre',
    x: 10,
    w: 290,
    title: 'CPU · Classique — préparation',
    side: 'classique',
    activeOn: [1, 2],
  },
  {
    id: 'qpu',
    x: 350,
    w: 300,
    title: 'QPU · Quantique — période r',
    side: 'quantique',
    activeOn: [3],
  },
  {
    id: 'cpu-post',
    x: 700,
    w: 290,
    title: 'CPU · Classique — post-traitement',
    side: 'classique',
    activeOn: [4],
  },
];

const BLOCKS: BlockDef[] = [
  {
    id: 'validate',
    x: 24,
    y: 54,
    w: 262,
    h: 58,
    label: '1. Valider N = p × q',
    sub: 'semi-premier impair',
    side: 'classique',
    activeOn: [1],
  },
  {
    id: 'base',
    x: 24,
    y: 124,
    w: 262,
    h: 58,
    label: '2. Choisir a · PGCD(a, N)',
    sub: 'coprimalité ou facteur trivial',
    side: 'classique',
    activeOn: [2],
  },
  {
    id: 'superpose',
    x: 364,
    y: 54,
    w: 272,
    h: 48,
    label: '3. Superposition |x⟩',
    sub: 'registre d’horloge',
    side: 'quantique',
    activeOn: [3],
  },
  {
    id: 'oracle',
    x: 364,
    y: 108,
    w: 272,
    h: 48,
    label: 'Oracle modulaire U_a',
    sub: '|x⟩|1⟩ → |x⟩|a^x mod N⟩',
    side: 'quantique',
    activeOn: [3],
  },
  {
    id: 'qft',
    x: 364,
    y: 162,
    w: 272,
    h: 48,
    label: 'QFT† puis mesure',
    sub: 'pic de Fourier → période r',
    side: 'quantique',
    activeOn: [3],
  },
  {
    id: 'euclid',
    x: 714,
    y: 54,
    w: 262,
    h: 58,
    label: '4. Algorithme d’Euclide',
    sub: 'PGCD(a^(r/2) ± 1, N)',
    side: 'classique',
    activeOn: [4],
  },
  {
    id: 'factors',
    x: 714,
    y: 124,
    w: 262,
    h: 58,
    label: 'Facteurs p et q',
    sub: 'N = p × q',
    side: 'classique',
    activeOn: [4],
  },
];

const GOLD = '#FBBF24';
const EMERALD = '#34d399';
const IDLE = '#163028';

function accent(side: Side): string {
  return side === 'quantique' ? GOLD : EMERALD;
}

export function HybridArchitectureDiagram({
  step,
}: HybridArchitectureDiagramProps) {
  const toQpuActive = step === 3;
  const toCpuActive = step === 4;

  return (
    <section className="rounded-2xl border border-[#163028] bg-[#0A1713]/90 p-4 backdrop-blur-md">
      <header className="mb-3">
        <h2 className="text-lg font-semibold text-white">
          Architecture hybride · Classique vs Quantique
        </h2>
        <p className="text-sm text-slate-400">
          Le QPU ne factorise pas N directement : il estime la période{' '}
          <span className="font-mono text-amber-300">r</span> de{' '}
          <span className="font-mono">f(x) = a^x mod N</span>. Le CPU prépare
          l’entrée, puis termine avec l’algorithme d’Euclide. Le bloc de
          l’étape active est surligné.
        </p>
      </header>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="h-auto w-full min-w-[40rem]"
          role="img"
          aria-label="Schéma comparatif : CPU classique, QPU quantique, puis CPU classique"
        >
          <defs>
            <marker
              id="arrow-gold"
              markerWidth="9"
              markerHeight="9"
              refX="7"
              refY="4.5"
              orient="auto"
            >
              <path d="M0,0 L9,4.5 L0,9 Z" fill={GOLD} />
            </marker>
            <marker
              id="arrow-emerald"
              markerWidth="9"
              markerHeight="9"
              refX="7"
              refY="4.5"
              orient="auto"
            >
              <path d="M0,0 L9,4.5 L0,9 Z" fill={EMERALD} />
            </marker>
            <marker
              id="arrow-idle"
              markerWidth="9"
              markerHeight="9"
              refX="7"
              refY="4.5"
              orient="auto"
            >
              <path d="M0,0 L9,4.5 L0,9 Z" fill="#2c4a40" />
            </marker>
          </defs>

          <rect width={VIEW_W} height={VIEW_H} rx="16" fill="#040B09" />

          {LANES.map((lane) => {
            const active = lane.activeOn.includes(step);
            const color = accent(lane.side);
            return (
              <g key={lane.id}>
                <rect
                  x={lane.x}
                  y={10}
                  width={lane.w}
                  height={VIEW_H - 20}
                  rx="14"
                  fill={lane.side === 'quantique' ? '#1c1408' : '#052e1f'}
                  fillOpacity={lane.side === 'quantique' ? 0.55 : 0.45}
                  stroke={active ? color : IDLE}
                  strokeWidth={active ? 2 : 1}
                  strokeDasharray={lane.side === 'quantique' ? '6 4' : undefined}
                />
                <text
                  x={lane.x + 14}
                  y={34}
                  fill={color}
                  fontSize="13"
                  fontFamily="ui-monospace, monospace"
                >
                  {lane.title}
                </text>
              </g>
            );
          })}

          {BLOCKS.map((block) => {
            const active = block.activeOn.includes(step);
            const color = accent(block.side);
            const fill = active
              ? block.side === 'quantique'
                ? '#3f2a0a'
                : '#064e3b'
              : '#0A1713';
            return (
              <g key={block.id}>
                <rect
                  x={block.x}
                  y={block.y}
                  width={block.w}
                  height={block.h}
                  rx="10"
                  fill={fill}
                  stroke={active ? color : IDLE}
                  strokeWidth={active ? 2.5 : 1}
                />
                <text
                  x={block.x + 14}
                  y={block.y + block.h / 2 - 2}
                  fill={active ? '#ffffff' : '#cbd5e1'}
                  fontSize="14"
                  fontFamily="ui-monospace, monospace"
                >
                  {block.label}
                </text>
                <text
                  x={block.x + 14}
                  y={block.y + block.h / 2 + 17}
                  fill="#94a3b8"
                  fontSize="12"
                  fontFamily="ui-monospace, monospace"
                >
                  {block.sub}
                </text>
              </g>
            );
          })}

          <path
            d="M300 153 L346 153"
            fill="none"
            stroke={toQpuActive ? GOLD : '#2c4a40'}
            strokeWidth="2.5"
            markerEnd={toQpuActive ? 'url(#arrow-gold)' : 'url(#arrow-idle)'}
          />
          <text
            x="323"
            y="142"
            textAnchor="middle"
            fill={toQpuActive ? GOLD : '#94a3b8'}
            fontSize="13"
            fontFamily="ui-monospace, monospace"
          >
            a, N
          </text>

          <path
            d="M650 186 L696 186"
            fill="none"
            stroke={toCpuActive ? EMERALD : '#2c4a40'}
            strokeWidth="2.5"
            markerEnd={toCpuActive ? 'url(#arrow-emerald)' : 'url(#arrow-idle)'}
          />
          <text
            x="673"
            y="175"
            textAnchor="middle"
            fill={toCpuActive ? EMERALD : '#94a3b8'}
            fontSize="13"
            fontFamily="ui-monospace, monospace"
          >
            r
          </text>
        </svg>
      </div>
    </section>
  );
}
