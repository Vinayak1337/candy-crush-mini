import { resolve, resolveSteps } from './engine';
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

	it('resolveSteps matches resolve and yields animatable frames', () => {
		const board: Board = generateBoard(candies, 5);
		board[0] = board[1] = board[2] = 'green';

		const stepped = resolveSteps(board, candies, makeRng(5));
		const flat = resolve(board, candies, makeRng(5));

		// Same final outcome as the one-shot resolve (identical rng order).
		expect(stepped.board).toEqual(flat.board);
		expect(stepped.score).toBe(flat.score);
		expect(stepped.cascades).toEqual(flat.cascades);

		// One frame per cascade, each carrying what to animate.
		expect(stepped.frames.length).toBe(stepped.cascades.length);
		expect(stepped.frames.length).toBeGreaterThan(0);

		// Frame scores add up to the total, and each frame replays correctly:
		// its `before` still holds the matches, and chaining the frames'
		// `after` boards lands on the final settled board.
		const summed = stepped.frames.reduce((s, f) => s + f.score, 0);
		expect(summed).toBe(stepped.score);

		const first = stepped.frames[0];
		expect(first.matched.length).toBeGreaterThanOrEqual(3);
		expect(findAllMatches(first.before).length).toBeGreaterThan(0);
		expect(first.changed.length).toBeGreaterThan(0);
		expect(stepped.frames[stepped.frames.length - 1].after).toEqual(
			stepped.board
		);
	});
});
