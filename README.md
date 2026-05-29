# Candy Crush Mini

A small match-3 game built with Create React App + TypeScript, Redux, and
styled-components. A 9×9 board: swap two adjacent candies to line up three or
more, watch the cascade clear and refill, and beat each level's target score
within a move limit.

## Architecture

The game is split into a **pure, framework-free logic layer** (`src/Assets/`)
and a thin React UI that renders it.

| Module | Responsibility |
|--------|----------------|
| `board.ts` | grid coordinates, match detection, swaps, gravity |
| `score.ts` | per-group points, cascade multipliers |
| `generate.ts` | seeded match-free starting boards |
| `engine.ts` | `resolve()` — the clear → gravity → refill cascade loop |
| `hint.ts` | find a legal move / detect a stuck board |
| `moves.ts` | enumerate all legal moves, pick the best |
| `reshuffle.ts` | reshuffle a stuck board into a playable one |
| `level.ts` | level ramp, win/lose status, progress |
| `format.ts` | HUD display helpers |

Every logic module is unit-tested; the React layer
(`src/Components/GamePage/Gamepage.tsx`) wires it to the board UI, HUD,
hint/shuffle/restart controls and the win/lose overlay.

## Run

```bash
npm install
npm start      # dev server
npm test       # unit tests + game smoke test
npm run build  # production bundle
```

> On Node 17+ the legacy OpenSSL provider is needed for react-scripts 4
> (webpack 4):
>
> ```bash
> NODE_OPTIONS=--openssl-legacy-provider npm start
> ```
>
> Source maps are disabled via `.env` to avoid a webpack-4 minifier bug on
> newer Node versions.
