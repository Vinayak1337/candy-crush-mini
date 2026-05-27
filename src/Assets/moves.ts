// Enumerate every legal move on a board (not just the first, as hint.ts does).
// Useful for AI hints, "shuffle when N moves remain" rules, and difficulty
// scoring. A move is an adjacent swap that creates at least one match.

import { Board, WIDTH, coordToIndex, isValidMove, swap, findAllMatches } from './board';

export interface Move {
	a: number;
	b: number;
}

/** All legal moves, scanning each cell's right and down neighbour once. */
export const allMoves = (board: Board): Move[] => {
	const moves: Move[] = [];
	for (let row = 0; row < WIDTH; row++) {
		for (let col = 0; col < WIDTH; col++) {
			const a = coordToIndex(row, col);
			if (col + 1 < WIDTH) {
				const b = coordToIndex(row, col + 1);
				if (isValidMove(board, a, b)) moves.push({ a, b });
			}
			if (row + 1 < WIDTH) {
				const b = coordToIndex(row + 1, col);
				if (isValidMove(board, a, b)) moves.push({ a, b });
			}
		}
	}
	return moves;
};

export const moveCount = (board: Board): number => allMoves(board).length;

/** The move that clears the most candies immediately (greedy best move). */
export const bestMove = (board: Board): Move | null => {
	let best: Move | null = null;
	let bestCleared = 0;
	for (const m of allMoves(board)) {
		const cleared = findAllMatches(swap(board, m.a, m.b)).length;
		if (cleared > bestCleared) {
			bestCleared = cleared;
			best = m;
		}
	}
	return best;
};
