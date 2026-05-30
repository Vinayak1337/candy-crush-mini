import { FC, useCallback, useMemo, useState } from 'react';
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
	resolve,
	isStuck,
	reshuffle,
	formatScore,
	comboLabel
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

// The logic layer is candy-agnostic: it just shuffles opaque string keys. Here
// we bind those keys to the candy artwork. generateBoard / resolve / reshuffle
// all operate on this same key list.
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

// Three star milestones along the score bar, like the real game.
const STAR_AT = [0.4, 0.7, 1];

/** A freshly generated board guaranteed to be playable (no matches, has moves). */
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
	const [invalid, setInvalid] = useState<number | null>(null);
	const [combo, setCombo] = useState('');
	const [busy, setBusy] = useState(false);

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
		setBusy(false);
	}, []);

	const onCellClick = useCallback(
		(i: number) => {
			if (busy || gameStatus !== 'playing') return;
			setHint(null);

			if (selected === null) {
				setSelected(i);
				return;
			}
			if (selected === i) {
				setSelected(null);
				return;
			}
			if (!areAdjacent(selected, i)) {
				setSelected(i); // re-pick a fresh starting candy
				return;
			}
			// Adjacent. A swap that makes no match is rejected and costs no move.
			if (!isValidMove(board, selected, i)) {
				setInvalid(i);
				window.setTimeout(() => setInvalid(null), 280);
				setSelected(null);
				return;
			}

			// Valid move: show the swap, then resolve cascades and settle.
			const a = selected;
			const swapped = swap(board, a, i);
			const result = resolve(swapped, KEYS);
			setSelected(null);
			setBusy(true);
			setBoard(swapped);

			window.setTimeout(() => {
				let settled = result.board;
				if (isStuck(settled)) settled = reshuffle(settled, KEYS, seed());
				setBoard(settled);
				setScore(s => s + result.score);
				setMovesUsed(m => m + 1);
				setCombo(comboLabel(result.cascades.length));
				window.setTimeout(() => setCombo(''), 1100);
				setBusy(false);
			}, 200);
		},
		[board, busy, gameStatus, selected]
	);

	const showHint = () => !busy && setHint(findHint(board));
	const doShuffle = () => !busy && setBoard(reshuffle(board, KEYS, seed()));

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

			<BoardGrid>
				{combo && <div className='combo'>{combo}</div>}
				{board.map((cell, i) => {
					const cls = [
						'cell',
						selected === i ? 'selected' : '',
						invalid === i ? 'invalid' : '',
						hint && (hint.a === i || hint.b === i) ? 'hint' : ''
					]
						.filter(Boolean)
						.join(' ');
					return (
						<button
							className={cls}
							key={`cell-${i}`}
							onClick={() => onCellClick(i)}
							aria-label={cell ?? 'empty'}>
							{cell && (
								<img src={CANDY[cell as keyof typeof CANDY]} alt={cell} />
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
