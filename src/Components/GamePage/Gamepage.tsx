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

	// Latest board for async animation steps and gesture handlers.
	const boardRef = useRef(board);
	boardRef.current = board;
	const selectedRef = useRef<number | null>(selected);
	selectedRef.current = selected;
	const busyRef = useRef(false);
	const pointer = useRef<{ i: number; x: number; y: number } | null>(null);

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

	// Attempt to swap two cells; reject (with a shake, no move spent) if the
	// swap makes no match.
	const attemptMove = useCallback(
		(a: number, b: number) => {
			if (busyRef.current || gameStatus !== 'playing') return;
			if (!areAdjacent(a, b)) return;
			if (!isValidMove(boardRef.current, a, b)) {
				// Reject: vibrate both candies left-right to say "can't match that".
				setSelected(null);
				setInvalid(new Set([a, b]));
				window.setTimeout(() => setInvalid(new Set()), 420);
				return;
			}
			animateMove(a, b);
		},
		[animateMove, gameStatus]
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

	const onPointerDown = (i: number) => (e: PointerEvent) => {
		pointer.current = { i, x: e.clientX, y: e.clientY };
	};

	// Released anywhere on the board: a small move is a tap, a larger one is a
	// swipe in one of the four directions.
	const onPointerUp = (e: PointerEvent) => {
		const st = pointer.current;
		pointer.current = null;
		if (!st) return;
		const dx = e.clientX - st.x;
		const dy = e.clientY - st.y;
		if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE) {
			handleTap(st.i);
			return;
		}
		const { row, col } = indexToCoord(st.i);
		let tr = row;
		let tc = col;
		if (Math.abs(dx) > Math.abs(dy)) tc += dx > 0 ? 1 : -1;
		else tr += dy > 0 ? 1 : -1;
		if (!inBounds(tr, tc)) {
			setSelected(null);
			return;
		}
		setSelected(null);
		attemptMove(st.i, coordToIndex(tr, tc));
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

			<BoardGrid onPointerUp={onPointerUp} onPointerLeave={() => (pointer.current = null)}>
				{combo && <div className='combo'>{combo}</div>}
				{board.map((cell, i) => {
					const cls = [
						'cell',
						selected === i ? 'selected' : '',
						invalid.has(i) ? 'invalid' : '',
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
