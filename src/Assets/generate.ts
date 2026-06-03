// Generate a starting board that contains NO pre-existing matches, so the
// player always begins from a stable position. Uses a seeded PRNG so boards
// are reproducible in tests.

import { WIDTH, Board, coordToIndex, hasMatch } from './board';

/** Tiny deterministic PRNG (mulberry32) so generated boards are repeatable. */
export const makeRng = (seed: number): (() => number) => {
	let a = seed >>> 0;
	return () => {
		a |= 0;
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
};

const shuffledCandies = (candies: string[], rng: () => number): string[] =>
	candies
		.map(candy => ({ candy, rank: rng() }))
		.sort((a, b) => a.rank - b.rank)
		.map(({ candy }) => candy);

/**
 * Fill the board candy-by-candy, never placing a candy that would create an
 * orthogonally connected same-color group of three or more.
 */
export const generateBoard = (candies: string[], seed = 1): Board => {
	const rng = makeRng(seed);
	const board: Board = Array(WIDTH * WIDTH).fill(null);

	for (let row = 0; row < WIDTH; row++) {
		for (let col = 0; col < WIDTH; col++) {
			const idx = coordToIndex(row, col);
			let pick = candies[Math.floor(rng() * candies.length)];

			for (const candidate of shuffledCandies(candies, rng)) {
				board[idx] = candidate;
				if (!hasMatch(board)) {
					pick = candidate;
					break;
				}
			}

			board[idx] = pick;
		}
	}
	return board;
};

/** Convenience guard used by tests: a freshly generated board has no matches. */
export const isStable = (board: Board): boolean => !hasMatch(board);
