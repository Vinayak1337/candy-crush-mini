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
import { GameContainer, HUD, BoardGrid, Overlay } from './Gamepage.styled';

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
	const pct = Math.round(progress(level, state) * 100);
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
			<HUD>
				<h1>Candy Crush Mini</h1>
				<div className='level'>Level {level.id}</div>

				<div className='stat'>
					<span>Score</span>
					<strong>{formatScore(score)}</strong>
				</div>
				<div className='stat'>
					<span>Target</span>
					<strong>{formatScore(level.targetScore)}</strong>
				</div>
				<div className='stat'>
					<span>Moves left</span>
					<strong className={left <= 3 ? 'low' : ''}>{left}</strong>
				</div>

				<div className='bar'>
					<div className='fill' style={{ width: `${pct}%` }} />
				</div>
				<div className='pct'>{pct}% to target</div>

				{combo && <div className='combo'>{combo}</div>}

				<div className='actions'>
					<button onClick={showHint} disabled={busy}>
						Hint
					</button>
					<button onClick={doShuffle} disabled={busy}>
						Shuffle
					</button>
					<button onClick={() => startLevel(level)} disabled={busy}>
						Restart
					</button>
					<button className='quit' onClick={() => toggleStarted(false)}>
						Quit
					</button>
				</div>
			</HUD>

			<BoardGrid>
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
							<h2>
								{gameStatus === 'won' ? 'Level Cleared!' : 'Out of Moves'}
							</h2>
							<p>
								Score <strong>{formatScore(score)}</strong> /{' '}
								{formatScore(level.targetScore)}
							</p>
							<div className='overlay-actions'>
								{gameStatus === 'won' && nextLevel && (
									<button onClick={() => startLevel(nextLevel)}>
										Next Level →
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
		</GameContainer>
	);
};

export default Gamepage;

interface GamepageProps {
	toggleStarted: (value: boolean) => void;
}
