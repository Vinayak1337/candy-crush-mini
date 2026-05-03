// Cascade engine: resolve all matches on a board, clearing matched candies,
// applying gravity, and refilling from the top, repeating until stable.
// Returns the final board plus the per-cascade group sizes and total score.

import { Board, WIDTH, findAllMatches, applyGravity, indexToCoord } from './board';
import { groupScore, cascadeMultiplier } from './score';

export interface ResolveResult {
	board: Board;
	cascades: number[][]; // group sizes cleared per cascade
	score: number;
	cleared: number; // total candies removed
}

/** Group matched indices into connected runs so we can size each clear. */
const groupSizes = (matched: number[]): number[] => {
	// Matched indices are already whole runs; approximate group sizes by
	// splitting on row breaks and non-contiguous indices.
	if (matched.length === 0) return [];
	const sorted = [...matched].sort((a, b) => a - b);
	const sizes: number[] = [];
	let run = 1;
	for (let i = 1; i < sorted.length; i++) {
		const prev = indexToCoord(sorted[i - 1]);
		const cur = indexToCoord(sorted[i]);
		const contiguous =
			(cur.row === prev.row && cur.col === prev.col + 1) ||
			(cur.col === prev.col && cur.row === prev.row + 1);
		if (contiguous) run++;
		else {
			sizes.push(run);
			run = 1;
		}
	}
	sizes.push(run);
	return sizes;
};

const refill = (board: Board, candies: string[], rng: () => number): Board =>
	board.map(cell => (cell === null ? candies[Math.floor(rng() * candies.length)] : cell));

export const resolve = (
	start: Board,
	candies: string[],
	rng: () => number = Math.random
): ResolveResult => {
	let board = start.slice();
	const cascades: number[][] = [];
	let score = 0;
	let cleared = 0;

	// Safety bound: a WIDTH^2 board cannot cascade more than its cell count.
	for (let pass = 0; pass < WIDTH * WIDTH; pass++) {
		const matched = findAllMatches(board);
		if (matched.length === 0) break;

		const sizes = groupSizes(matched);
		cascades.push(sizes);
		cleared += matched.length;
		const raw = sizes.reduce((s, n) => s + groupScore(n), 0);
		score += raw * cascadeMultiplier(cascades.length);

		matched.forEach(i => (board[i] = null));
		board = applyGravity(board);
		board = refill(board, candies, rng);
	}

	return { board, cascades, score, cleared };
};
