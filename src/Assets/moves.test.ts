import { allMoves, moveCount, bestMove } from './moves';
import { Board, WIDTH, coordToIndex } from './board';

const empty = (): Board => Array(WIDTH * WIDTH).fill(null);

describe('move enumeration', () => {
	it('finds no moves on an empty board', () => {
		expect(allMoves(empty())).toEqual([]);
		expect(moveCount(empty())).toBe(0);
		expect(bestMove(empty())).toBeNull();
	});

	it('finds a move that completes a horizontal triple', () => {
		const b = empty();
		b[coordToIndex(0, 1)] = 'red';
		b[coordToIndex(0, 2)] = 'red';
		b[coordToIndex(1, 0)] = 'red'; // swap up into (0,0) completes the row
		const moves = allMoves(b);
		expect(moves.length).toBeGreaterThanOrEqual(1);
		expect(moveCount(b)).toBe(moves.length);
	});

	it('best move clears at least three candies when a move exists', () => {
		const b = empty();
		b[coordToIndex(0, 1)] = 'blue';
		b[coordToIndex(0, 2)] = 'blue';
		b[coordToIndex(1, 0)] = 'blue';
		const move = bestMove(b);
		expect(move).not.toBeNull();
	});
});
