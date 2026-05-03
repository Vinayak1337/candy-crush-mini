import { resolve } from './engine';
import { Board, WIDTH, findAllMatches } from './board';
import { makeRng, generateBoard } from './generate';

const candies = ['red', 'green', 'blue', 'yellow', 'orange', 'purple'];

describe('cascade engine', () => {
	it('leaves a match-free board completely stable', () => {
		const board = generateBoard(candies, 7);
		const result = resolve(board, candies, makeRng(7));
		expect(result.cascades.length).toBe(0);
		expect(result.score).toBe(0);
		expect(result.cleared).toBe(0);
	});

	it('clears an initial match and scores it', () => {
		const board: Board = generateBoard(candies, 3);
		// Force a horizontal triple at the top row.
		board[0] = board[1] = board[2] = 'red';
		const result = resolve(board, candies, makeRng(3));
		expect(result.cleared).toBeGreaterThanOrEqual(3);
		expect(result.score).toBeGreaterThan(0);
		// The resolved board must itself be stable.
		expect(findAllMatches(result.board).length).toBe(0);
	});

	it('produces a fully filled board (no nulls left)', () => {
		const board: Board = generateBoard(candies, 9);
		board[0] = board[1] = board[2] = 'blue';
		const result = resolve(board, candies, makeRng(9));
		expect(result.board.every(c => c !== null)).toBe(true);
		expect(result.board.length).toBe(WIDTH * WIDTH);
	});
});
