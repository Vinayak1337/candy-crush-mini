// Find a legal move on the current board, or report that the board is stuck
// (no moves) so the game can reshuffle. A move is a swap of two adjacent cells
// that produces at least one match.

import { Board, WIDTH, coordToIndex, isValidMove } from './board';

export interface Move {
	a: number;
	b: number;
}

/** Return the first legal move found, scanning right and down, or null. */
export const findHint = (board: Board): Move | null => {
	for (let row = 0; row < WIDTH; row++) {
		for (let col = 0; col < WIDTH; col++) {
			const a = coordToIndex(row, col);
			if (col + 1 < WIDTH) {
				const b = coordToIndex(row, col + 1);
				if (isValidMove(board, a, b)) return { a, b };
			}
			if (row + 1 < WIDTH) {
				const b = coordToIndex(row + 1, col);
				if (isValidMove(board, a, b)) return { a, b };
			}
		}
	}
	return null;
};

/** True when no legal move exists and the board should be reshuffled. */
export const isStuck = (board: Board): boolean => findHint(board) === null;
