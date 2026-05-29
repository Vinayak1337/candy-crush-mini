import { LEVELS, getLevel, movesLeft, status, progress } from './level';

describe('levels', () => {
	it('exposes an increasing difficulty ramp', () => {
		for (let i = 1; i < LEVELS.length; i++) {
			expect(LEVELS[i].targetScore).toBeGreaterThan(LEVELS[i - 1].targetScore);
			expect(LEVELS[i].maxMoves).toBeLessThanOrEqual(LEVELS[i - 1].maxMoves);
		}
	});

	it('looks up a level by id', () => {
		expect(getLevel(1)).toEqual({ id: 1, targetScore: 500, maxMoves: 20 });
		expect(getLevel(999)).toBeUndefined();
	});

	it('reports won / lost / playing correctly', () => {
		const lvl = getLevel(1)!;
		expect(status(lvl, { score: 500, movesUsed: 3 })).toBe('won');
		expect(status(lvl, { score: 0, movesUsed: 20 })).toBe('lost');
		expect(status(lvl, { score: 100, movesUsed: 4 })).toBe('playing');
	});

	it('clamps moves left and progress', () => {
		const lvl = getLevel(1)!;
		expect(movesLeft(lvl, { score: 0, movesUsed: 25 })).toBe(0);
		expect(progress(lvl, { score: 250, movesUsed: 1 })).toBe(0.5);
		expect(progress(lvl, { score: 9999, movesUsed: 1 })).toBe(1);
	});
});
