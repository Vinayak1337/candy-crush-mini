# Game Logic

The match-3 rules live in pure, framework-free modules under `src/Assets/` so
they can be unit-tested without React. The UI layer only reads board state and
dispatches moves.

## Modules

| Module        | Responsibility                                                        |
| ------------- | --------------------------------------------------------------------- |
| `board.ts`    | Coordinates, match detection, immutable swap, gravity                 |
| `score.ts`    | Points per cleared group, large-group bonus, cascade multiplier       |
| `generate.ts` | Seeded PRNG + match-free starting board generator                     |
| `engine.ts`   | Cascade resolver: clear → gravity → refill, repeated until stable     |
| `hint.ts`     | Find a legal move; detect a stuck board                               |
| `reshuffle.ts`| Rebuild a playable (match-free, has-move) board when stuck            |

## Move lifecycle

1. Player swaps two adjacent candies.
2. `isValidMove` checks adjacency **and** that the swap creates a match.
3. `engine.resolve` clears matches, drops candies with `applyGravity`, refills
   the empty cells, and repeats — accumulating score with a rising cascade
   multiplier.
4. After resolving, `hint.isStuck` decides whether the board needs a
   `reshuffle`.

## Invariants

- A board handed to the player is always **match-free** and has **at least one
  legal move** (`isPlayable`).
- All board operations are **immutable** — they return a new array.
- Generation and reshuffling are **seeded**, so any board state is reproducible
  in tests.

## Coordinate system

The board is a flat `Cell[]` of length `WIDTH * WIDTH` (9×9). Index `i` maps to
`{ row: i / WIDTH, col: i % WIDTH }`; row 0 is the top, column 0 is the left.
