import { useCallback, useEffect, useMemo, useState } from 'react';
import { BaseSelector } from './components/BaseSelector';
import { HybridArchitectureDiagram } from './components/HybridArchitectureDiagram';
import { ModularTable } from './components/ModularTable';
import { NumberSelector } from './components/NumberSelector';
import { PeriodicityChart } from './components/PeriodicityChart';
import { StepCard } from './components/StepCard';
import { StepPlayer } from './components/StepPlayer';
import {
  analyzeNumber,
  coprimes,
  findSuccessfulBase,
  randomCoprime,
  runShorSimulation,
} from './shor/math';
import type { PlaybackSpeed, ShorStepId } from './types/shor';

const SPEED_MS: Record<PlaybackSpeed, number> = {
  0.5: 2400,
  1: 1200,
  2: 600,
};

function clampStep(value: number): ShorStepId {
  if (value <= 1) return 1;
  if (value === 2) return 2;
  if (value === 3) return 3;
  return 4;
}

function App() {
  const [input, setInput] = useState('15');
  const [n, setN] = useState(15);
  const [a, setA] = useState(7);
  const [step, setStep] = useState<ShorStepId>(1);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);
  const [hoveredX, setHoveredX] = useState<number | null>(null);

  const analysis = useMemo(() => analyzeNumber(n), [n]);
  const coprimeList = useMemo(
    () => (analysis.valid ? coprimes(analysis.n) : []),
    [analysis],
  );
  const simulation = useMemo(() => runShorSimulation(n, a), [n, a]);

  const applyN = useCallback((next: number): void => {
    setN(next);
    setInput(String(next));
    const nextAnalysis = analyzeNumber(next);
    if (nextAnalysis.valid) {
      const preferred = findSuccessfulBase(next) ?? coprimes(next)[0] ?? 2;
      setA(preferred);
    }
    setStep(1);
    setPlaying(false);
  }, []);

  const onInputChange = (value: string): void => {
    setInput(value);
    const parsed = Number(value);
    if (!Number.isInteger(parsed)) {
      setN(Number.NaN);
      return;
    }
    setN(parsed);
    const nextAnalysis = analyzeNumber(parsed);
    if (nextAnalysis.valid) {
      const preferred = findSuccessfulBase(parsed) ?? coprimes(parsed)[0] ?? 2;
      setA(preferred);
    }
    setStep(1);
    setPlaying(false);
  };

  const onRandomA = (): void => {
    const picked = randomCoprime(n, a);
    if (picked !== null) setA(picked);
  };

  const onSuccessfulA = (): void => {
    const picked = findSuccessfulBase(n, a);
    if (picked !== null) setA(picked);
  };

  useEffect(() => {
    if (!playing) return;
    if (step >= 4) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setStep(clampStep(step + 1));
    }, SPEED_MS[speed]);
    return () => window.clearTimeout(timer);
  }, [playing, step, speed]);

  const onTogglePlay = (): void => {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (step >= 4) setStep(1);
    setPlaying(true);
  };

  return (
    <div className="min-h-svh bg-[#040B09] bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.06),_transparent_50%)] text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <header className="mb-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-300">
            Visualisation pédagogique
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Algorithme de Shor
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-400 sm:text-base">
            Factoriser <span className="font-mono text-white">N = p × q</span>{' '}
            se ramène à trouver la période{' '}
            <span className="font-mono text-amber-300">r</span> de{' '}
            <span className="font-mono">f(x) = a^x mod N</span> lorsque{' '}
            <span className="font-mono">PGCD(a, N) = 1</span>. Un ordinateur
            quantique estime r via superposition, oracle modulaire{' '}
            <span className="font-mono">U_a</span> et{' '}
            <span className="font-mono">QFT†</span> ; le post-traitement
            d’Euclide reste classique. Simulation hybride légère : seuls les
            premiers termes de f sont calculés, r est révélé ensuite, puis p et
            q sont extraits en direct.
          </p>
        </header>

        <div className="mb-4">
          <HybridArchitectureDiagram step={step} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-4">
            <NumberSelector
              n={n}
              input={input}
              analysis={analysis}
              onInputChange={onInputChange}
              onSelectN={applyN}
            />
            <BaseSelector
              n={Number.isFinite(n) ? n : 15}
              a={a}
              coprimeList={coprimeList}
              simulation={simulation}
              disabled={!analysis.valid}
              onSelectA={setA}
              onRandomA={onRandomA}
              onSuccessfulA={onSuccessfulA}
            />
            <StepPlayer
              step={step}
              playing={playing}
              speed={speed}
              onStep={(next) => {
                setPlaying(false);
                setStep(next);
              }}
              onPrev={() => {
                setPlaying(false);
                setStep(clampStep(step - 1));
              }}
              onNext={() => {
                setPlaying(false);
                setStep(clampStep(step + 1));
              }}
              onTogglePlay={onTogglePlay}
              onReset={() => {
                setPlaying(false);
                setStep(1);
              }}
              onSpeed={setSpeed}
            />
            <StepCard step={step} simulation={simulation} />
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            {step >= 3 && (
              <>
                <ModularTable
                  simulation={simulation}
                  hoveredX={hoveredX}
                  onHoverX={setHoveredX}
                />
                <PeriodicityChart
                  simulation={simulation}
                  hoveredX={hoveredX}
                  onHoverX={setHoveredX}
                />
              </>
            )}
            {step < 3 && (
              <p className="rounded-2xl border border-dashed border-[#163028] bg-[#0A1713]/90 p-6 text-sm text-slate-400">
                Le tableau modulaire et le graphique de périodicité apparaissent
                à l’étape 3, lorsque le QPU révèle r.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
