import { FC, PointerEvent, useCallback, useMemo, useRef, useState } from 'react';
import {
	BlueCandy,
	GreenCandy,
	YellowCandy,
	OrangeCandy,
	RedCandy,
	PurpleCandy
} from '../../Assets/Images';
import {
	Board,
	generateBoard,
	swap,
	areAdjacent,
	isValidMove,
	resolveSteps,
	isStuck,
	reshuffle,
	formatScore,
	comboLabel,
	indexToCoord,
	coordToIndex,
	inBounds
} from '../../Assets/gameLogic';
import { findHint, Move } from '../../Assets/hint';
import { LEVELS, Level, status, movesLeft, progress } from '../../Assets/level';
import {
	GameContainer,
	TopBar,
	Board as BoardGrid,
	Controls,
	DragLayer,
	Overlay
} from './Gamepage.styled';

const CANDY = {
	red: RedCandy,
	green: GreenCandy,
	blue: BlueCandy,
	yellow: YellowCandy,
	orange: OrangeCandy,
	purple: PurpleCandy
} as const;
const KEYS = Object.keys(CANDY);
const seed = () => (Date.now() ^ Math.floor(Math.random() * 0xffff)) % 100000;
const STAR_AT = [0.4, 0.7, 1];
const SWIPE = 14; // px before a drag counts as a swipe
const sleep = (ms: number) => new Promise(r => window.setTimeout(r, ms));
const axisValue = (axis: 'x' | 'y', x: number, y: number) => (axis === 'x' ? x : y);
const clamp = (value: number, min: number, max: number) =>
	Math.max(min, Math.min(max, value));

const freshBoard = (): Board => {
	const b = generateBoard(KEYS, seed());
	return isStuck(b) ? reshuffle(b, KEYS, seed()) : b;
};

const Gamepage: FC<GamepageProps> = ({ toggleStarted }) => {
	const [level, setLevel] = useState<Level>(LEVELS[0]);
	const [board, setBoard] = useState<Board>(freshBoard);
	const [score, setScore] = useState(0);
	const [movesUsed, setMovesUsed] = useState(0);
	const [selected, setSelected] = useState<number | null>(null);
	const [hint, setHint] = useState<Move | null>(null);
	const [invalid, setInvalid] = useState<Set<number>>(new Set());
	const [clearing, setClearing] = useState<Set<number>>(new Set());
	const [falling, setFalling] = useState<Set<number>>(new Set());
	const [combo, setCombo] = useState('');
	const [busy, setBusy] = useState(false);
	const [drag, setDrag] = useState<DragState | null>(null);

	// Latest board for async animation steps and gesture handlers.
	const boardRef = useRef(board);
	boardRef.current = board;
	const selectedRef = useRef<number | null>(selected);
	selectedRef.current = selected;
	const busyRef = useRef(false);
	const gridRef = useRef<HTMLDivElement | null>(null);
	const pointer = useRef<PointerState | null>(null);

	const state = useMemo(() => ({ score, movesUsed }), [score, movesUsed]);
	const gameStatus = status(level, state);
	const left = movesLeft(level, state);
	const frac = progress(level, state);
	const stars = STAR_AT.filter(t => frac >= t).length;
	const nextLevel = LEVELS.find(l => l.id === level.id + 1);

	const startLevel = useCallback((lvl: Level) => {
		setLevel(lvl);
		setScore(0);
		setMovesUsed(0);
		setBoard(freshBoard());
		setSelected(null);
		setHint(null);
		setCombo('');
		setClearing(new Set());
		setFalling(new Set());
		setInvalid(new Set());
		busyRef.current = false;
		setBusy(false);
	}, []);

	// Animate the swap, then play each cascade: matched candies shrink away,
	// survivors and fresh candies drop in. Driven by resolveSteps frames.
	const animateMove = useCallback(async (a: number, b: number) => {
		const start = boardRef.current;
		const swapped = swap(start, a, b);
		const steps = resolveSteps(swapped, KEYS);

		busyRef.current = true;
		setBusy(true);
		setSelected(null);
		setHint(null);
		setBoard(swapped);
		await sleep(170);

		for (const f of steps.frames) {
			setBoard(f.before);
			setClearing(new Set(f.matched));
			await sleep(230);
			setClearing(new Set());
			setBoard(f.after);
			setFalling(new Set(f.changed));
			setScore(s => s + f.score);
			await sleep(300);
			setFalling(new Set());
		}

		let settled = steps.board;
		if (isStuck(settled)) {
			settled = reshuffle(settled, KEYS, seed());
			setBoard(settled);
		}
		setMovesUsed(m => m + 1);
		setCombo(comboLabel(steps.cascades.length));
		window.setTimeout(() => setCombo(''), 1100);
		busyRef.current = false;
		setBusy(false);
	}, []);

	const animateRejectedMove = useCallback(async (a: number, b: number) => {
		const start = boardRef.current;
		const swapped = swap(start, a, b);

		busyRef.current = true;
		setBusy(true);
		setSelected(null);
		setBoard(swapped);
		await sleep(130);
		setBoard(start);
		setInvalid(new Set([a, b]));
		await sleep(310);
		setInvalid(new Set());
		busyRef.current = false;
		setBusy(false);
	}, []);

	// Attempt to swap two cells; reject (with a shake, no move spent) if the
	// swap makes no match.
	const attemptMove = useCallback(
		(a: number, b: number) => {
			if (busyRef.current || gameStatus !== 'playing') return;
			if (!areAdjacent(a, b)) return;
			if (!isValidMove(boardRef.current, a, b)) {
				// Reject like a match-3 board: finish the swap, then snap back.
				animateRejectedMove(a, b);
				return;
			}
			animateMove(a, b);
		},
		[animateMove, animateRejectedMove, gameStatus]
	);

	// Tap-to-select fallback (tap a candy, then an adjacent candy).
	const handleTap = useCallback(
		(i: number) => {
			if (busyRef.current || gameStatus !== 'playing') return;
			setHint(null);
			const prev = selectedRef.current;
			if (prev === null) {
				setSelected(i);
				return;
			}
			if (prev === i) {
				setSelected(null);
				return;
			}
			if (!areAdjacent(prev, i)) {
				setSelected(i);
				return;
			}
			setSelected(null);
			attemptMove(prev, i);
		},
		[attemptMove, gameStatus]
	);

	const getCellStep = useCallback(() => {
		const el = gridRef.current;
		if (!el) return 0;
		const style = window.getComputedStyle(el);
		const paddingX =
			Number.parseFloat(style.paddingLeft) + Number.parseFloat(style.paddingRight);
		const gap = Number.parseFloat(style.columnGap || style.gap || '0');
		return (el.clientWidth - paddingX - gap * 8) / 9 + gap;
	}, []);

	const getCellFrame = useCallback((i: number): CellFrame | null => {
		const grid = gridRef.current;
		const cell = grid?.querySelectorAll<HTMLButtonElement>('button.cell')[i];
		if (!grid || !cell) return null;
		const gridRect = grid.getBoundingClientRect();
		const cellRect = cell.getBoundingClientRect();
		return {
			left: cellRect.left - gridRect.left,
			top: cellRect.top - gridRect.top,
			width: cellRect.width,
			height: cellRect.height
		};
	}, []);

	const getSwipeTarget = useCallback((origin: number, dx: number, dy: number) => {
		const { row, col } = indexToCoord(origin);
		let tr = row;
		let tc = col;
		if (Math.abs(dx) > Math.abs(dy)) tc += dx > 0 ? 1 : -1;
		else tr += dy > 0 ? 1 : -1;
		return inBounds(tr, tc) ? coordToIndex(tr, tc) : null;
	}, []);

	const onPointerDown = (i: number) => (e: PointerEvent) => {
		if (busyRef.current || gameStatus !== 'playing') return;
		e.currentTarget.setPointerCapture(e.pointerId);
		pointer.current = {
			i,
			id: e.pointerId,
			x: e.clientX,
			y: e.clientY,
			step: getCellStep(),
			originFrame: getCellFrame(i)
		};
		setSelected(null);
		setHint(null);
	};

	const onPointerMove = (e: PointerEvent) => {
		const st = pointer.current;
		if (!st || st.id !== e.pointerId || busyRef.current || gameStatus !== 'playing') {
			return;
		}
		const dx = e.clientX - st.x;
		const dy = e.clientY - st.y;
		if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE) return;

		const target = getSwipeTarget(st.i, dx, dy);
		const targetFrame = target === null ? null : getCellFrame(target);
		if (target === null || !st.originFrame || !targetFrame || st.step <= 0) {
			setDrag({
				origin: st.i,
				target: null,
				axis: Math.abs(dx) > Math.abs(dy) ? 'x' : 'y',
				x: 0,
				y: 0,
				step: st.step,
				originFrame: st.originFrame,
				targetFrame: null
			});
			return;
		}

		const axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
		const direction = axisValue(axis, dx, dy) > 0 ? 1 : -1;
		const distance = clamp(Math.abs(axisValue(axis, dx, dy)), 0, st.step);
		setDrag({
			origin: st.i,
			target,
			axis,
			x: axis === 'x' ? direction * distance : 0,
			y: axis === 'y' ? direction * distance : 0,
			step: st.step,
			originFrame: st.originFrame,
			targetFrame
		});
	};

	const resetPointer = () => {
		pointer.current = null;
		setDrag(null);
	};

	// Released anywhere on the board: a small move is a tap, a larger one is a
	// swipe in one of the four directions. During the swipe the two candies have
	// already been sliding toward each other, so release simply commits/rejects it.
	const onPointerUp = (e: PointerEvent) => {
		const st = pointer.current;
		if (!st || st.id !== e.pointerId) return;
		const currentDrag = drag;
		resetPointer();
		if (!st) return;
		const dx = e.clientX - st.x;
		const dy = e.clientY - st.y;
		if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE) {
			handleTap(st.i);
			return;
		}
		const target = currentDrag?.target ?? getSwipeTarget(st.i, dx, dy);
		if (target === null) {
			setSelected(null);
			return;
		}
		setSelected(null);
		attemptMove(st.i, target);
	};

	const showHint = () => !busyRef.current && setHint(findHint(board));
	const doShuffle = () =>
		!busyRef.current && setBoard(reshuffle(board, KEYS, seed()));

	return (
		<GameContainer>
			<TopBar>
				<div className='moves'>
					<span className={`num ${left <= 3 ? 'low' : ''}`}>{left}</span>
					<span className='lbl'>moves</span>
				</div>

				<div className='score'>
					<div className='value'>{formatScore(score)}</div>
					<div className='track'>
						<div className='fill' style={{ width: `${frac * 100}%` }} />
						{STAR_AT.map((t, idx) => (
							<span
								key={t}
								className={`star ${idx < stars ? 'on' : ''}`}
								style={{ left: `${t * 100}%` }}>
								★
							</span>
						))}
					</div>
					<div className='goal'>target {formatScore(level.targetScore)}</div>
				</div>

				<div className='level'>
					<span className='lbl'>level</span>
					<span className='num'>{level.id}</span>
				</div>
			</TopBar>

			<BoardGrid
				ref={gridRef}
				onPointerMove={onPointerMove}
				onPointerUp={onPointerUp}
				onPointerCancel={resetPointer}
				onLostPointerCapture={resetPointer}>
				{combo && <div className='combo'>{combo}</div>}
				{board.map((cell, i) => {
					const cls = [
						'cell',
						selected === i ? 'selected' : '',
						invalid.has(i) ? 'invalid' : '',
						drag?.origin === i ? 'dragging' : '',
						drag?.target === i ? 'drag-target' : '',
						drag && (drag.origin === i || drag.target === i) ? 'drag-hidden' : '',
						clearing.has(i) ? 'clearing' : '',
						falling.has(i) ? 'falling' : '',
						hint && (hint.a === i || hint.b === i) ? 'hint' : ''
					]
						.filter(Boolean)
						.join(' ');
					return (
						<button
							className={cls}
							key={`cell-${i}`}
							onPointerDown={onPointerDown(i)}
							aria-label={cell ?? 'empty'}>
							{cell && (
								<img
									src={CANDY[cell as keyof typeof CANDY]}
									alt={cell}
									draggable={false}
									style={
										falling.has(i)
											? { animationDelay: `${indexToCoord(i).row * 0.022}s` }
											: undefined
									}
								/>
							)}
						</button>
					);
				})}

				{drag &&
					drag.target !== null &&
					drag.originFrame &&
					drag.targetFrame &&
					board[drag.origin] &&
					board[drag.target] && (
						<DragLayer>
							<img
								className='drag-candy active'
								src={CANDY[board[drag.origin] as keyof typeof CANDY]}
								alt=''
								style={{
									left: drag.originFrame.left,
									top: drag.originFrame.top,
									width: drag.originFrame.width,
									height: drag.originFrame.height,
									transform: `translate3d(${drag.x}px, ${drag.y}px, 0) scale(1.08)`
								}}
							/>
							<img
								className='drag-candy target'
								src={CANDY[board[drag.target] as keyof typeof CANDY]}
								alt=''
								style={{
									left: drag.targetFrame.left,
									top: drag.targetFrame.top,
									width: drag.targetFrame.width,
									height: drag.targetFrame.height,
									transform: `translate3d(${-drag.x}px, ${-drag.y}px, 0) scale(1.02)`
								}}
							/>
						</DragLayer>
					)}

				{gameStatus !== 'playing' && (
					<Overlay className={gameStatus}>
						<div className='card'>
							<div className='stars'>
								{[0, 1, 2].map(s => (
									<span key={s} className={s < stars ? 'on' : ''}>
										★
									</span>
								))}
							</div>
							<h2>{gameStatus === 'won' ? 'Sweet!' : 'Out of Moves'}</h2>
							<p>
								<strong>{formatScore(score)}</strong> /{' '}
								{formatScore(level.targetScore)}
							</p>
							<div className='overlay-actions'>
								{gameStatus === 'won' && nextLevel && (
									<button onClick={() => startLevel(nextLevel)}>
										Next Level
									</button>
								)}
								{gameStatus === 'won' && !nextLevel && (
									<button onClick={() => startLevel(LEVELS[0])}>
										Play Again
									</button>
								)}
								{gameStatus === 'lost' && (
									<button onClick={() => startLevel(level)}>Retry</button>
								)}
								<button className='ghost' onClick={() => toggleStarted(false)}>
									Home
								</button>
							</div>
						</div>
					</Overlay>
				)}
			</BoardGrid>

			<Controls>
				<button className='act hint' onClick={showHint} disabled={busy}>
					<b>?</b>
					<span>Hint</span>
				</button>
				<button className='act shuffle' onClick={doShuffle} disabled={busy}>
					<b>⇄</b>
					<span>Shuffle</span>
				</button>
				<button
					className='act restart'
					onClick={() => startLevel(level)}
					disabled={busy}>
					<b>↻</b>
					<span>Restart</span>
				</button>
				<button className='act quit' onClick={() => toggleStarted(false)}>
					<b>⌂</b>
					<span>Home</span>
				</button>
			</Controls>
		</GameContainer>
	);
};

export default Gamepage;

interface GamepageProps {
	toggleStarted: (value: boolean) => void;
}

interface PointerState {
	i: number;
	id: number;
	x: number;
	y: number;
	step: number;
	originFrame: CellFrame | null;
}

interface DragState {
	origin: number;
	target: number | null;
	axis: 'x' | 'y';
	x: number;
	y: number;
	step: number;
	originFrame: CellFrame | null;
	targetFrame: CellFrame | null;
}

interface CellFrame {
	left: number;
	top: number;
	width: number;
	height: number;
}
