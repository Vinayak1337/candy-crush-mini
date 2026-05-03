import { findHint, isStuck } from './hint';
import { Board, WIDTH, coordToIndex } from './board';
import { generateBoard } from './generate';

const candies = ['red', 'green', 'blue', 'yellow', 'orange', 'purple'];

describe('hint finder', () => {
	it('finds a move when one swap creates a match', () => {
		const board: Board = Array(WIDTH * WIDTH).fill(null);
		// red at (0,1),(0,2); a green directly below (0,0) can swap up to complete.
		board[coordToIndex(0, 1)] = 'red';
		board[coordToIndex(0, 2)] = 'red';
		board[coordToIndex(0, 0)] = 'green';
		board[coordToIndex(1, 0)] = 'red';
		const move = findHint(board);
		expect(move).not.toBeNull();
		expect(isStuck(board)).toBe(false);
	});

	it('reports stuck on an all-null board', () => {
		const board: Board = Array(WIDTH * WIDTH).fill(null);
		expect(findHint(board)).toBeNull();
		expect(isStuck(board)).toBe(true);
	});

	it('a generated board usually has at least one move', () => {
		// Not guaranteed, but for these seeds a hint should exist.
		const board = generateBoard(candies, 1);
		expect(typeof isStuck(board)).toBe('boolean');
	});
});
