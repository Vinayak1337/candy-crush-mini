// When the board has no legal moves (isStuck), reshuffle the existing candies
// into a new arrangement that is both match-free and has at least one move.
// Falls back to a freshly generated board if reshuffling keeps failing.

import { Board, hasMatch } from './board';
import { isStuck } from './hint';
import { makeRng, generateBoard } from './generate';

/** Fisher–Yates shuffle of a copy using a seeded PRNG. */
const shuffled = (board: Board, rng: () => number): Board => {
	const next = board.slice();
	for (let i = next.length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1));
		[next[i], next[j]] = [next[j], next[i]];
	}
	return next;
};

/** A playable board has no current matches but does have a legal move. */
export const isPlayable = (board: Board): boolean =>
	!hasMatch(board) && !isStuck(board);

export const reshuffle = (
	board: Board,
	candies: string[],
	seed = 1
): Board => {
	const rng = makeRng(seed);
	for (let attempt = 0; attempt < 50; attempt++) {
		const candidate = shuffled(board, rng);
		if (isPlayable(candidate)) return candidate;
	}
	// Give up reshuffling the same candies — generate a fresh playable board.
	for (let seed2 = 1; seed2 < 100; seed2++) {
		const fresh = generateBoard(candies, seed + seed2);
		if (isPlayable(fresh)) return fresh;
	}
	return generateBoard(candies, seed);
};
