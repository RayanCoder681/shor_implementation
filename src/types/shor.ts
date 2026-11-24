export const N_MIN = 4;
export const N_MAX = 10_000;

export const VALID_PRESETS = [15, 21, 35, 77, 143] as const;
export const PRIME_TRAP_PRESET = 17;

export type ValidPreset = (typeof VALID_PRESETS)[number];

export type NumberKind =
  | 'valid-semiprime'
  | 'prime'
  | 'even'
  | 'prime-power'
  | 'not-semiprime'
  | 'too-many-factors'
  | 'out-of-range';

export interface PrimeFactor {
  prime: number;
  exponent: number;
}

export interface NumberAnalysis {
  n: number;
  kind: NumberKind;
  factors: PrimeFactor[];
  p: number | null;
  q: number | null;
  valid: boolean;
  title: string;
  message: string;
}

export interface GcdStep {
  a: number;
  b: number;
  quotient: number;
  remainder: number;
}

export interface ModularTerm {
  x: number;
  value: number;
  /** Numéro du cycle de longueur r auquel appartient x (0 = premier cycle). */
  cycle: number;
  /** Position de x dans son cycle (x mod r). */
  cycleIndex: number;
  isPeriodBoundary: boolean;
  isUnity: boolean;
}

export type AttemptOutcome =
  | 'invalid-n'
  | 'trivial-factor'
  | 'odd-period'
  | 'minus-one'
  | 'success'
  | 'order-missing';

export interface EuclidTrace {
  label: string;
  value: number;
  residue: number;
  steps: GcdStep[];
  result: number;
}

export interface ShorSimulation {
  n: number;
  a: number;
  analysis: NumberAnalysis;
  gcdAN: number;
  gcdANSteps: GcdStep[];
  order: number | null;
  terms: ModularTerm[];
  displayedCount: number;
  outcome: AttemptOutcome;
  halfPower: number | null;
  minusOneCongruence: boolean;
  euclidMinus: EuclidTrace | null;
  euclidPlus: EuclidTrace | null;
  factors: readonly [number, number] | null;
  explanation: string;
}

export type ShorStepId = 1 | 2 | 3 | 4;

export type PlaybackSpeed = 0.5 | 1 | 2;

export const SHOR_STEPS: readonly {
  id: ShorStepId;
  title: string;
  domain: 'classique' | 'quantique';
}[] = [
  { id: 1, title: 'Validation de N', domain: 'classique' },
  { id: 2, title: 'Choix de a et coprimalité', domain: 'classique' },
  { id: 3, title: 'Recherche de période r', domain: 'quantique' },
  { id: 4, title: 'Post-traitement (Euclide)', domain: 'classique' },
];
