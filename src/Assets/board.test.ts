import {
	WIDTH,
	indexToCoord,
	coordToIndex,
	inBounds,
	findMatchGroups,
	findAllMatches,
	hasMatch,
	swap,
	areAdjacent,
	isValidMove,
	applyGravity,
	Board
} from './board';

const fill = (value: string): Board => Array(WIDTH * WIDTH).fill(value);

describe('board coordinates', () => {
	it('round-trips index <-> coord', () => {
		for (let i = 0; i < WIDTH * WIDTH; i++) {
			const { row, col } = indexToCoord(i);
			expect(coordToIndex(row, col)).toBe(i);
		}
	});

	it('rejects out-of-bounds coords', () => {
		expect(inBounds(0, 0)).toBe(true);
		expect(inBounds(-1, 0)).toBe(false);
		expect(inBounds(0, WIDTH)).toBe(false);
	});
});

describe('match detection', () => {
	it('finds a full uniform board as matched', () => {
		expect(hasMatch(fill('red'))).toBe(true);
		expect(findAllMatches(fill('red')).length).toBe(WIDTH * WIDTH);
	});

	it('detects a horizontal run of three', () => {
		const b: Board = Array(WIDTH * WIDTH).fill(null);
		b[0] = b[1] = b[2] = 'blue';
		expect(findAllMatches(b)).toEqual([0, 1, 2]);
	});

	it('detects connected Z-shaped same-color neighbours', () => {
		const b: Board = Array(WIDTH * WIDTH).fill(null);
		b[0] = b[1] = b[coordToIndex(1, 1)] = b[coordToIndex(1, 2)] =
			'purple';

		expect(findMatchGroups(b)).toEqual([[0, 1, 10, 11]]);
		expect(findAllMatches(b)).toEqual([0, 1, 10, 11]);
	});

	it('detects connected T-shaped same-color neighbours as one group', () => {
		const b: Board = Array(WIDTH * WIDTH).fill(null);
		[
			coordToIndex(0, 1),
			coordToIndex(1, 0),
			coordToIndex(1, 1),
			coordToIndex(1, 2),
			coordToIndex(2, 1)
		].forEach(i => (b[i] = 'green'));

		expect(findMatchGroups(b)).toEqual([[1, 9, 10, 11, 19]]);
		expect(findAllMatches(b)).toEqual([1, 9, 10, 11, 19]);
	});

	it('ignores runs of two', () => {
		const b: Board = Array(WIDTH * WIDTH).fill(null);
		b[0] = b[1] = 'blue';
		expect(hasMatch(b)).toBe(false);
	});

	it('does not connect candies diagonally', () => {
		const b: Board = Array(WIDTH * WIDTH).fill(null);
		b[0] = b[coordToIndex(1, 1)] = b[coordToIndex(2, 2)] = 'yellow';

		expect(findMatchGroups(b)).toEqual([]);
		expect(hasMatch(b)).toBe(false);
	});
});

describe('moves', () => {
	it('knows adjacency', () => {
		expect(areAdjacent(0, 1)).toBe(true);
		expect(areAdjacent(0, WIDTH)).toBe(true);
		expect(areAdjacent(0, 2)).toBe(false);
	});

	it('swap is immutable and reversible', () => {
		const b: Board = Array(WIDTH * WIDTH).fill(null);
		b[0] = 'a';
		b[1] = 'b';
		const s = swap(b, 0, 1);
		expect(s[0]).toBe('b');
		expect(b[0]).toBe('a'); // original untouched
	});

	it('validates a move that creates a match', () => {
		const b: Board = Array(WIDTH * WIDTH).fill(null);
		// indices 1,2 are green; placing green at 0 via a swap makes a run.
		b[1] = b[2] = 'green';
		b[0] = 'red';
		b[WIDTH] = 'green'; // sits directly below index 0
		expect(isValidMove(b, 0, WIDTH)).toBe(true);
	});
});

describe('gravity', () => {
	it('drops candies to the bottom of each column', () => {
		const b: Board = Array(WIDTH * WIDTH).fill(null);
		b[0] = 'x'; // top-left
		const g = applyGravity(b);
		expect(g[0]).toBeNull();
		expect(g[coordToIndex(WIDTH - 1, 0)]).toBe('x');
	});
});
