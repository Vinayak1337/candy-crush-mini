import { reshuffle, isPlayable } from './reshuffle';
import { Board, WIDTH } from './board';

const candies = ['red', 'green', 'blue', 'yellow', 'orange', 'purple'];

describe('reshuffle', () => {
	it('turns a fully-matched board into a playable one', () => {
		const stuck: Board = Array(WIDTH * WIDTH).fill('red');
		const out = reshuffle(stuck, candies, 5);
		expect(isPlayable(out)).toBe(true);
	});

	it('preserves the board size', () => {
		const stuck: Board = Array(WIDTH * WIDTH).fill('blue');
		const out = reshuffle(stuck, candies, 2);
		expect(out.length).toBe(WIDTH * WIDTH);
	});

	it('is deterministic for a given seed', () => {
		const stuck: Board = Array(WIDTH * WIDTH).fill('green');
		const a = reshuffle(stuck, candies, 11);
		const b = reshuffle(stuck, candies, 11);
		expect(a).toEqual(b);
	});
});
