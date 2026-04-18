import {
	BASE_POINTS,
	groupScore,
	cascadeMultiplier,
	moveScore,
	isClearable
} from './score';
import { generateBoard, makeRng, isStable } from './generate';

describe('scoring', () => {
	it('awards nothing for groups smaller than three', () => {
		expect(groupScore(0)).toBe(0);
		expect(groupScore(2)).toBe(0);
		expect(isClearable(2)).toBe(false);
	});

	it('scales with group size including a large-group bonus', () => {
		expect(groupScore(3)).toBe(3 * BASE_POINTS);
		expect(groupScore(4)).toBe(4 * BASE_POINTS + BASE_POINTS * 2);
		expect(groupScore(5)).toBeGreaterThan(groupScore(4));
	});

	it('escalates the cascade multiplier', () => {
		expect(cascadeMultiplier(1)).toBe(1);
		expect(cascadeMultiplier(2)).toBe(1.5);
		expect(cascadeMultiplier(3)).toBe(2);
	});

	it('combines cascades into a move score', () => {
		// One group of 3 on cascade 1, one group of 3 on cascade 2.
		const total = moveScore([[3], [3]]);
		expect(total).toBe(groupScore(3) * 1 + groupScore(3) * 1.5);
	});
});

describe('board generation', () => {
	it('is deterministic for a given seed', () => {
		const r1 = makeRng(42);
		const r2 = makeRng(42);
		expect(r1()).toBe(r2());
	});

	it('produces a board with no initial matches', () => {
		const candies = ['red', 'green', 'blue', 'yellow', 'orange', 'purple'];
		for (let seed = 1; seed <= 5; seed++) {
			expect(isStable(generateBoard(candies, seed))).toBe(true);
		}
	});
});
