// Level configuration and win/lose evaluation. A level sets a target score to
// reach within a limited number of moves; the engine reports progress and the
// UI shows pass/fail. Pure data + predicates, no React.

export interface Level {
	id: number;
	targetScore: number;
	maxMoves: number;
}

export interface GameState {
	score: number;
	movesUsed: number;
}

export type LevelStatus = 'playing' | 'won' | 'lost';

// A gentle difficulty ramp: each level needs more points with fewer moves.
export const LEVELS: Level[] = [
	{ id: 1, targetScore: 500, maxMoves: 20 },
	{ id: 2, targetScore: 1200, maxMoves: 18 },
	{ id: 3, targetScore: 2500, maxMoves: 16 },
	{ id: 4, targetScore: 4000, maxMoves: 15 },
	{ id: 5, targetScore: 6000, maxMoves: 14 }
];

export const getLevel = (id: number): Level | undefined =>
	LEVELS.find(l => l.id === id);

export const movesLeft = (level: Level, state: GameState): number =>
	Math.max(0, level.maxMoves - state.movesUsed);

export const status = (level: Level, state: GameState): LevelStatus => {
	if (state.score >= level.targetScore) return 'won';
	if (state.movesUsed >= level.maxMoves) return 'lost';
	return 'playing';
};

// Progress toward the target as a 0..1 fraction (clamped) for a progress bar.
export const progress = (level: Level, state: GameState): number =>
	Math.min(1, Math.max(0, state.score / level.targetScore));
