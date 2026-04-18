// Scoring rules for cleared candy matches. A base value per candy, a bonus for
// larger groups, and an escalating multiplier for chained cascades.

export const BASE_POINTS = 10;

/** Points awarded for clearing a single group of `size` candies. */
export const groupScore = (size: number): number => {
	if (size < 3) return 0;
	// 3 -> 30, 4 -> 60 (+ bonus), 5+ -> grows super-linearly.
	const bonus = size > 3 ? (size - 3) * BASE_POINTS * 2 : 0;
	return size * BASE_POINTS + bonus;
};

/** Multiplier applied on the Nth cascade in a single move (1-indexed). */
export const cascadeMultiplier = (cascade: number): number =>
	cascade <= 1 ? 1 : 1 + (cascade - 1) * 0.5;

/** Total score for one move: groups cleared across successive cascades. */
export const moveScore = (groupsPerCascade: number[][]): number =>
	groupsPerCascade.reduce((total, groups, i) => {
		const raw = groups.reduce((s, size) => s + groupScore(size), 0);
		return total + raw * cascadeMultiplier(i + 1);
	}, 0);

export const isClearable = (size: number): boolean => size >= 3;
