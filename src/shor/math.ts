import {
  N_MAX,
  N_MIN,
  VALID_PRESETS,
  type EuclidTrace,
  type GcdStep,
  type ModularTerm,
  type NumberAnalysis,
  type NumberKind,
  type PrimeFactor,
  type ShorSimulation,
} from '../types/shor';

export function gcd(a: number, b: number): number {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y !== 0) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

export function gcdSteps(a: number, b: number): GcdStep[] {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return [];
  const steps: GcdStep[] = [];
  const absA = Math.abs(Math.trunc(a));
  const absB = Math.abs(Math.trunc(b));
  let x = Math.max(absA, absB);
  let y = Math.min(absA, absB);
  while (y !== 0) {
    const quotient = Math.floor(x / y);
    const remainder = x % y;
    steps.push({ a: x, b: y, quotient, remainder });
    x = y;
    y = remainder;
  }
  return steps;
}

export function modPow(base: number, exp: number, mod: number): number {
  if (mod <= 1) return 0;
  if (exp < 0) {
    throw new Error('modPow ne gère pas les exposants négatifs.');
  }
  let result = 1n;
  let b = BigInt(Math.trunc(base)) % BigInt(mod);
  if (b < 0n) b += BigInt(mod);
  let e = BigInt(Math.trunc(exp));
  const m = BigInt(mod);
  while (e > 0n) {
    if ((e & 1n) === 1n) result = (result * b) % m;
    b = (b * b) % m;
    e >>= 1n;
  }
  return Number(result);
}

export function isPrime(n: number): boolean {
  const x = Math.trunc(n);
  if (x < 2) return false;
  if (x % 2 === 0) return x === 2;
  if (x % 3 === 0) return x === 3;
  const limit = Math.floor(Math.sqrt(x));
  for (let d = 5; d <= limit; d += 6) {
    if (x % d === 0 || x % (d + 2) === 0) return false;
  }
  return true;
}

export function factorize(n: number): PrimeFactor[] {
  const factors: PrimeFactor[] = [];
  let x = Math.abs(Math.trunc(n));
  if (x < 2) return factors;

  const push = (prime: number): void => {
    let exponent = 0;
    while (x % prime === 0) {
      x = x / prime;
      exponent += 1;
    }
    if (exponent > 0) factors.push({ prime, exponent });
  };

  push(2);
  push(3);
  for (let p = 5; p * p <= x; p += 6) {
    push(p);
    push(p + 2);
  }
  if (x > 1) factors.push({ prime: x, exponent: 1 });
  return factors;
}

export function formatFactors(factors: PrimeFactor[]): string {
  if (factors.length === 0) return '—';
  return factors
    .map(({ prime, exponent }) =>
      exponent === 1 ? String(prime) : `${prime}^${exponent}`,
    )
    .join(' × ');
}

function kindTitle(kind: NumberKind): string {
  switch (kind) {
    case 'valid-semiprime':
      return 'N est un semi-premier impair valide';
    case 'prime':
      return 'N est un nombre premier';
    case 'even':
      return 'N est pair';
    case 'prime-power':
      return 'N est une puissance d’un premier';
    case 'not-semiprime':
      return 'N n’est pas le produit de deux premiers distincts';
    case 'too-many-factors':
      return 'N a trop de facteurs premiers distincts';
    case 'out-of-range':
      return 'N est hors de la plage pédagogique';
  }
}

export function analyzeNumber(n: number): NumberAnalysis {
  const truncated = Math.trunc(n);

  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    return {
      n: truncated,
      kind: 'out-of-range',
      factors: [],
      p: null,
      q: null,
      valid: false,
      title: 'N doit être un entier',
      message: `Saisissez un entier entre ${N_MIN} et ${N_MAX}. L’algorithme de Shor vise un semi-premier impair N = p × q.`,
    };
  }

  if (truncated < N_MIN || truncated > N_MAX) {
    return {
      n: truncated,
      kind: 'out-of-range',
      factors: [],
      p: null,
      q: null,
      valid: false,
      title: kindTitle('out-of-range'),
      message: `Pour garder l’interface instantanée et les graphiques lisibles, N doit être un entier entre ${N_MIN} et ${N_MAX}.`,
    };
  }

  const factors = factorize(truncated);

  if (truncated % 2 === 0) {
    return {
      n: truncated,
      kind: 'even',
      factors,
      p: null,
      q: null,
      valid: false,
      title: kindTitle('even'),
      message: `N = ${truncated} est pair, donc divisible par 2. L’algorithme de Shor (version RSA pédagogique) vise un semi-premier impair N = p × q : on factorise d’abord le facteur 2 classiquement.`,
    };
  }

  if (isPrime(truncated)) {
    return {
      n: truncated,
      kind: 'prime',
      factors: [{ prime: truncated, exponent: 1 }],
      p: null,
      q: null,
      valid: false,
      title: kindTitle('prime'),
      message: `N = ${truncated} est premier : il n’a pas de facteurs non triviaux. Shor factorise un composé N = p × q, pas un premier.`,
    };
  }

  if (factors.length === 1) {
    return {
      n: truncated,
      kind: 'prime-power',
      factors,
      p: null,
      q: null,
      valid: false,
      title: kindTitle('prime-power'),
      message: `N = ${truncated} = ${formatFactors(factors)}. C’est une puissance d’un seul premier. La réduction « période → deux facteurs distincts » suppose deux premiers distincts p et q, pas p^k.`,
    };
  }

  if (factors.length > 2) {
    return {
      n: truncated,
      kind: 'too-many-factors',
      factors,
      p: null,
      q: null,
      valid: false,
      title: kindTitle('too-many-factors'),
      message: `N = ${truncated} = ${formatFactors(factors)} possède ${factors.length} facteurs premiers distincts. Cette démo se concentre sur le cas RSA N = p × q.`,
    };
  }

  const [f1, f2] = factors;
  if (f1.exponent !== 1 || f2.exponent !== 1) {
    return {
      n: truncated,
      kind: 'not-semiprime',
      factors,
      p: null,
      q: null,
      valid: false,
      title: kindTitle('not-semiprime'),
      message: `N = ${truncated} = ${formatFactors(factors)} n’est pas un semi-premier (produit exact de deux premiers distincts à la puissance 1).`,
    };
  }

  return {
    n: truncated,
    kind: 'valid-semiprime',
    factors,
    p: f1.prime,
    q: f2.prime,
    valid: true,
    title: kindTitle('valid-semiprime'),
    message: `N = ${truncated} = ${f1.prime} × ${f2.prime}. C’est le cas visé : un semi-premier impair, à factoriser en ramenant le problème à la période de a^x mod N.`,
  };
}

export function suggestValidN(n: number): number {
  return VALID_PRESETS.reduce((best, preset) =>
    Math.abs(preset - n) < Math.abs(best - n) ? preset : best,
  );
}

export function coprimes(n: number): number[] {
  if (!Number.isFinite(n) || n <= 2) return [];
  const result: number[] = [];
  const limit = Math.trunc(n);
  for (let a = 2; a < limit; a += 1) {
    if (gcd(a, limit) === 1) result.push(a);
  }
  return result;
}

export function findOrder(a: number, n: number): number | null {
  if (!Number.isFinite(a) || !Number.isFinite(n)) return null;
  if (n <= 1 || gcd(a, n) !== 1) return null;
  let value = 1;
  for (let r = 1; r <= n; r += 1) {
    value = (value * (a % n)) % n;
    if (value === 1) return r;
  }
  return null;
}

function residueGcd(residue: number, offset: number, n: number): number {
  const shifted = ((residue + offset) % n + n) % n;
  return gcd(shifted, n);
}

function euclidTrace(
  label: string,
  residue: number,
  offset: number,
  n: number,
): EuclidTrace {
  const shifted = ((residue + offset) % n + n) % n;
  const value = offset === -1 ? residue - 1 : residue + 1;
  return {
    label,
    value,
    residue: shifted,
    steps: gcdSteps(n, shifted),
    result: residueGcd(residue, offset, n),
  };
}

function buildTerms(
  a: number,
  n: number,
  order: number | null,
): { terms: ModularTerm[]; displayedCount: number } {
  const displayedCount =
    order === null ? 16 : Math.min(16, Math.max(2 * order, 1));
  const terms: ModularTerm[] = [];
  for (let x = 0; x < displayedCount; x += 1) {
    const value = modPow(a, x, n);
    const cycleIndex = order === null ? x : x % order;
    const cycle = order === null ? 0 : Math.floor(x / order);
    terms.push({
      x,
      value,
      cycle,
      cycleIndex,
      isPeriodBoundary: order !== null && x % order === 0,
      isUnity: value === 1,
    });
  }
  return { terms, displayedCount };
}

export function runShorSimulation(n: number, a: number): ShorSimulation {
  const analysis = analyzeNumber(n);
  const safeN = analysis.n;
  const safeA = Number.isFinite(a) ? Math.trunc(a) : 0;
  const gcdAN = gcd(safeA, safeN);
  const gcdANSteps = gcdSteps(safeA, safeN);

  const base: Omit<
    ShorSimulation,
    'outcome' | 'explanation' | 'order' | 'terms' | 'displayedCount'
  > = {
    n: safeN,
    a: safeA,
    analysis,
    gcdAN,
    gcdANSteps,
    halfPower: null,
    minusOneCongruence: false,
    euclidMinus: null,
    euclidPlus: null,
    factors: null,
  };

  if (!analysis.valid) {
    const { terms, displayedCount } = Number.isFinite(safeN) && safeN > 1
      ? buildTerms(Math.max(2, safeA), Math.max(2, safeN), null)
      : { terms: [], displayedCount: 0 };
    return {
      ...base,
      order: null,
      terms,
      displayedCount,
      outcome: 'invalid-n',
      explanation: analysis.message,
    };
  }

  if (safeA <= 1 || safeA >= safeN) {
    const { terms, displayedCount } = buildTerms(2, safeN, null);
    return {
      ...base,
      a: safeA,
      order: null,
      terms,
      displayedCount,
      outcome: 'order-missing',
      explanation: `Choisissez une base a telle que 1 < a < N. Ici a = ${safeA} est hors de cet intervalle.`,
    };
  }

  if (gcdAN > 1) {
    const cofactor = safeN / gcdAN;
    const { terms, displayedCount } = buildTerms(safeA, safeN, null);
    return {
      ...base,
      order: null,
      terms,
      displayedCount,
      outcome: 'trivial-factor',
      factors: [gcdAN, cofactor],
      explanation: `PGCD(a, N) = PGCD(${safeA}, ${safeN}) = ${gcdAN} > 1. Inutile d’appeler le QPU : on a déjà un facteur non trivial. N = ${gcdAN} × ${cofactor}.`,
    };
  }

  const order = findOrder(safeA, safeN);
  const { terms, displayedCount } = buildTerms(safeA, safeN, order);

  if (order === null) {
    return {
      ...base,
      order: null,
      terms,
      displayedCount,
      outcome: 'order-missing',
      explanation: `Impossible de trouver l’ordre de ${safeA} modulo ${safeN}. Ce cas ne devrait pas arriver si PGCD(a, N) = 1.`,
    };
  }

  if (order % 2 === 1) {
    return {
      ...base,
      order,
      terms,
      displayedCount,
      outcome: 'odd-period',
      explanation: `La période r = ${order} est impaire. On ne peut pas former a^(r/2). Cette tentative échoue : on tire une autre base a et on recommence (côté quantique, on relance la recherche de période).`,
    };
  }

  const halfPower = modPow(safeA, order / 2, safeN);
  const minusOneCongruence = halfPower === safeN - 1;

  if (minusOneCongruence) {
    return {
      ...base,
      order,
      terms,
      displayedCount,
      halfPower,
      minusOneCongruence: true,
      outcome: 'minus-one',
      explanation: `r = ${order} est pair, mais a^(r/2) ≡ ${halfPower} ≡ −1 (mod ${safeN}). Les PGCD(a^(r/2) ± 1, N) sont triviaux (1 et N). Cette tentative échoue : on change de a.`,
    };
  }

  const euclidMinus = euclidTrace(`a^(r/2) − 1`, halfPower, -1, safeN);
  const euclidPlus = euclidTrace(`a^(r/2) + 1`, halfPower, 1, safeN);
  const p = euclidMinus.result;
  const q = euclidPlus.result;
  const success = p > 1 && q > 1 && p * q === safeN;

  return {
    ...base,
    order,
    terms,
    displayedCount,
    halfPower,
    minusOneCongruence: false,
    euclidMinus,
    euclidPlus,
    factors: [p, q] as const,
    outcome: success ? 'success' : 'order-missing',
    explanation: success
      ? `Succès : a^(r/2) ≢ ±1 (mod N). PGCD(${halfPower} − 1, ${safeN}) = ${p} et PGCD(${halfPower} + 1, ${safeN}) = ${q}, donc N = ${p} × ${q}.`
      : `Les PGCD n’ont pas restitué une factorisation complète (obtenu ${p} et ${q}). Réessayez avec une autre base a.`,
  };
}

export function findSuccessfulBase(n: number, exclude?: number): number | null {
  const candidates = coprimes(n);
  const rotated =
    exclude === undefined
      ? candidates
      : [
          ...candidates.filter((c) => c > exclude),
          ...candidates.filter((c) => c < exclude),
        ];
  const limit = Math.min(rotated.length, 48);
  for (let i = 0; i < limit; i += 1) {
    const candidate = rotated[i];
    if (candidate === undefined) continue;
    const sim = runShorSimulation(n, candidate);
    if (sim.outcome === 'success') return candidate;
  }
  return rotated[0] ?? null;
}

export function randomCoprime(n: number, exclude?: number): number | null {
  const list = coprimes(n).filter((a) => a !== exclude);
  if (list.length === 0) return null;
  const index = Math.floor(Math.random() * list.length);
  return list[index] ?? null;
}

