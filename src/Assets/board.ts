// Pure board logic for the candy grid. The game renders a WIDTH x WIDTH board
// stored as a flat array; these helpers handle coordinates, match detection,
// and swaps without touching React state, so they are easy to unit-test.

export const WIDTH = 9;

export type Cell = string | null;
export type Board = Cell[];

/** Convert a flat index into { row, col }. */
export const indexToCoord = (index: number): { row: number; col: number } => ({
	row: Math.floor(index / WIDTH),
	col: index % WIDTH
});

/** Convert { row, col } back into a flat index. */
export const coordToIndex = (row: number, col: number): number =>
	row * WIDTH + col;

/** True when row/col fall inside the board. */
export const inBounds = (row: number, col: number): boolean =>
	row >= 0 && row < WIDTH && col >= 0 && col < WIDTH;

const orthogonalNeighbours = (index: number): number[] => {
	const { row, col } = indexToCoord(index);
	const coords = [
		[row - 1, col],
		[row + 1, col],
		[row, col - 1],
		[row, col + 1]
	];
	return coords
		.filter(([r, c]) => inBounds(r, c))
		.map(([r, c]) => coordToIndex(r, c));
};

/**
 * Find every connected same-color group of >= 3 candies.
 * Connectivity is only orthogonal: left, right, top, and bottom. Diagonals do
 * not connect groups.
 */
export const findMatchGroups = (board: Board): number[][] => {
	const visited = new Set<number>();
	const groups: number[][] = [];

	for (let start = 0; start < board.length; start++) {
		const color = board[start];
		if (color === null || visited.has(start)) continue;

		const group: number[] = [];
		const stack = [start];
		visited.add(start);

		while (stack.length > 0) {
			const current = stack.pop() as number;
			group.push(current);

			for (const next of orthogonalNeighbours(current)) {
				if (!visited.has(next) && board[next] === color) {
					visited.add(next);
					stack.push(next);
				}
			}
		}

		if (group.length >= 3) {
			groups.push(group.sort((a, b) => a - b));
		}
	}

	return groups.sort((a, b) => a[0] - b[0]);
};

/** All flat indices that are part of an orthogonally connected match. */
export const findAllMatches = (board: Board): number[] =>
	findMatchGroups(board)
		.flat()
		.sort((a, b) => a - b);

/** Convenience: does the board currently contain any match? */
export const hasMatch = (board: Board): boolean =>
	findAllMatches(board).length > 0;

/** Return a new board with the candies at two indices swapped (immutable). */
export const swap = (board: Board, a: number, b: number): Board => {
	const next = board.slice();
	[next[a], next[b]] = [next[b], next[a]];
	return next;
};

/** Two cells are adjacent if they touch horizontally or vertically. */
export const areAdjacent = (a: number, b: number): boolean => {
	const ca = indexToCoord(a);
	const cb = indexToCoord(b);
	const d = Math.abs(ca.row - cb.row) + Math.abs(ca.col - cb.col);
	return d === 1;
};

/**
 * A swap is legal only if the two cells are adjacent and the resulting board
 * contains at least one new match — the core rule of the game.
 */
export const isValidMove = (board: Board, a: number, b: number): boolean =>
	areAdjacent(a, b) && hasMatch(swap(board, a, b));

/**
 * Apply gravity per column: non-null candies fall to the bottom and empty
 * cells bubble to the top, ready to be refilled.
 */
export const applyGravity = (board: Board): Board => {
	const next: Board = board.slice();
	for (let col = 0; col < WIDTH; col++) {
		const column: Cell[] = [];
		for (let row = 0; row < WIDTH; row++) {
			const cell = next[coordToIndex(row, col)];
			if (cell !== null) column.push(cell);
		}
		const pad = WIDTH - column.length;
		for (let row = 0; row < WIDTH; row++) {
			next[coordToIndex(row, col)] = row < pad ? null : column[row - pad];
		}
	}
	return next;
};
