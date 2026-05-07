// Display helpers for the game HUD: format the score with thousands separators
// and render the combo/cascade level as a short label.

export const formatScore = (score: number): string =>
	Math.max(0, Math.floor(score)).toLocaleString('en-US');

export const comboLabel = (cascade: number): string => {
	if (cascade <= 1) return '';
	if (cascade === 2) return 'Nice!';
	if (cascade === 3) return 'Great!';
	if (cascade === 4) return 'Awesome!';
	return 'Unstoppable!';
};

// Clamp a displayed value so the HUD never shows negatives or NaN.
export const safeNumber = (n: number, fallback = 0): number =>
	Number.isFinite(n) ? n : fallback;
