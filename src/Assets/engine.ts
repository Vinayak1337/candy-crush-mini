// Cascade engine: resolve all matches on a board, clearing matched candies,
// applying gravity, and refilling from the top, repeating until stable.
// Returns the final board plus the per-cascade group sizes and total score.

import { Board, WIDTH, findMatchGroups, applyGravity } from './board';
import { groupScore, cascadeMultiplier } from './score';

export interface ResolveResult {
	board: Board;
	cascades: number[][]; // group sizes cleared per cascade
	score: number;
	cleared: number; // total candies removed
}

/**
 * One cascade step, exposed so the UI can animate the cascade frame-by-frame
 * (clear the matched candies, then drop the survivors and new candies in)
 * instead of snapping straight to the settled board.
 */
export interface CascadeFrame {
	matched: number[]; // indices that matched and get cleared this step
	before: Board; // board with the matches still present (pre-clear)
	after: Board; // board after clear + gravity + refill
	changed: number[]; // indices whose candy moved or is newly spawned
	groups: number[]; // sizes of the cleared groups
	score: number; // points gained on this step
}

export interface StepResult extends ResolveResult {
	frames: CascadeFrame[];
}

const refill = (board: Board, candies: string[], rng: () => number): Board =>
	board.map(cell => (cell === null ? candies[Math.floor(rng() * candies.length)] : cell));

/**
 * Resolve a board and record every cascade step. `resolve` is a thin wrapper
 * around this, so the scoring and refill order are identical (and the existing
 * engine tests keep passing); the UI uses `frames` to animate.
 */
export const resolveSteps = (
	start: Board,
	candies: string[],
	rng: () => number = Math.random
): StepResult => {
	let board = start.slice();
	const cascades: number[][] = [];
	const frames: CascadeFrame[] = [];
	let score = 0;
	let cleared = 0;

	// Safety bound: a WIDTH^2 board cannot cascade more than its cell count.
	for (let pass = 0; pass < WIDTH * WIDTH; pass++) {
		const groups = findMatchGroups(board);
		if (groups.length === 0) break;
		const matched = groups.flat().sort((a, b) => a - b);

		const before = board.slice();
		const sizes = groups.map(group => group.length);
		cascades.push(sizes);
		cleared += matched.length;
		const raw = sizes.reduce((s, n) => s + groupScore(n), 0);
		const gained = raw * cascadeMultiplier(cascades.length);
		score += gained;

		let next = board.slice();
		matched.forEach(i => (next[i] = null));
		next = applyGravity(next);
		next = refill(next, candies, rng);

		const changed: number[] = [];
		for (let i = 0; i < next.length; i++) {
			if (next[i] !== before[i]) changed.push(i);
		}
		frames.push({
			matched,
			before,
			after: next.slice(),
			changed,
			groups: sizes,
			score: gained
		});
		board = next;
	}

	return { board, cascades, score, cleared, frames };
};

export const resolve = (
	start: Board,
	candies: string[],
	rng: () => number = Math.random
): ResolveResult => {
	const { board, cascades, score, cleared } = resolveSteps(start, candies, rng);
	return { board, cascades, score, cleared };
};
