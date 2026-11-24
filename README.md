# Algorithme de Shor — visualisation pédagogique

Application web **100 % client** (React + TypeScript + Vite + Tailwind CSS) pour comprendre la factorisation d’un semi-premier \(N = p \times q\) via la recherche de période de \(f(x) = a^x \bmod N\).

## Prérequis

- [Node.js](https://nodejs.org/) 20+ (LTS recommandé)
- npm (fourni avec Node.js)

## Lancer le projet

```bash
cd shor_algorithm
npm install
npm run dev
```

Ouvre l’URL affichée par Vite (en général `http://localhost:5173`).

## Autres commandes

| Commande | Rôle |
|---|---|
| `npm run build` | Compile TypeScript et produit le bundle dans `dist/` |
| `npm run preview` | Sert le build de production en local |
| `npm run lint` | Analyse le code avec Oxlint |

## Utilisation

1. Choisis \(N\) (préréglages `15`, `21`, `35`, `77`, `143`, ou saisie libre). Un \(N\) premier / pair / non semi-premier affiche une alerte et un bouton vers un exemple valide.
2. Choisis une base \(a\) copremière à \(N\), ou tire-en une au hasard.
3. Parcours les 4 étapes (validation, coprimalité, période, Euclide) en pas à pas ou en auto-lecture.

Tout le calcul (PGCD, ordre, facteurs) s’exécute dans le navigateur. \(N\) est borné à \(4\)–\(10\,000\).
