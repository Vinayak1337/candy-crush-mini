import styled, { keyframes } from 'styled-components';

const CANDY = `'Candice', 'Segoe UI', system-ui, sans-serif`;

// Matched candies shrink and spin away; survivors and fresh candies drop in.
const clearOut = keyframes`
	0%   { transform: scale(1) rotate(0); opacity: 1; }
	100% { transform: scale(0) rotate(45deg); opacity: 0; }
`;
const fallIn = keyframes`
	0%   { transform: translateY(-150%); opacity: 0; }
	55%  { opacity: 1; }
	75%  { transform: translateY(8%); }
	100% { transform: translateY(0); opacity: 1; }
`;
// Reject wobble: a quick left-right vibration meaning "you can't match that".
const shake = keyframes`
	0%, 100% { transform: translateX(0); }
	12% { transform: translateX(-7px); }
	26% { transform: translateX(7px); }
	40% { transform: translateX(-6px); }
	54% { transform: translateX(6px); }
	68% { transform: translateX(-4px); }
	82% { transform: translateX(4px); }
	92% { transform: translateX(-2px); }
`;
const pop = keyframes`
	0% { transform: scale(0.5); opacity: 0; }
	60% { transform: scale(1.15); opacity: 1; }
	100% { transform: scale(1); }
`;
const floatUp = keyframes`
	0% { transform: translate(-50%, 10px) scale(0.7); opacity: 0; }
	25% { transform: translate(-50%, 0) scale(1.1); opacity: 1; }
	80% { opacity: 1; }
	100% { transform: translate(-50%, -34px) scale(1); opacity: 0; }
`;

export const GameContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16px;
	min-height: 100vh;
	width: 100vw;
	padding: 18px 16px 24px;
	box-sizing: border-box;
`;

/* ------------------------------------------------------------------ top bar */
export const TopBar = styled.div`
	width: min(94vw, 600px);
	display: flex;
	align-items: center;
	gap: 14px;
	padding: 12px 16px;
	border-radius: 22px;
	background: linear-gradient(180deg, #7b3ff2 0%, #5a23c8 100%);
	box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.35),
		inset 0 -5px 10px rgba(0, 0, 0, 0.3), 0 8px 22px rgba(0, 0, 0, 0.45);

	/* round jelly badges on each side */
	.moves,
	.level {
		flex: 0 0 auto;
		width: 62px;
		height: 62px;
		border-radius: 50%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: #fff;
		text-shadow: 0 2px 2px rgba(0, 0, 0, 0.4);
		box-shadow: inset 0 3px 2px rgba(255, 255, 255, 0.55),
			inset 0 -6px 8px rgba(0, 0, 0, 0.35), 0 4px 8px rgba(0, 0, 0, 0.35);

		.num {
			font-family: ${CANDY};
			font-size: 30px;
			line-height: 1;
		}
		.num.low {
			color: #ffdf6b;
		}
		.lbl {
			font-family: ${CANDY};
			font-size: 13px;
			text-transform: lowercase;
			letter-spacing: 0.3px;
			opacity: 0.95;
			margin-top: 2px;
		}
	}
	.moves {
		background: radial-gradient(circle at 50% 30%, #ff8fb8, #e23d7a);
	}
	.level {
		background: radial-gradient(circle at 50% 30%, #6fd6ff, #1f8bd6);
	}

	.score {
		flex: 1 1 auto;
		min-width: 0;
		text-align: center;

		.value {
			font-family: ${CANDY};
			font-size: 26px;
			color: #fff;
			text-shadow: 0 2px 3px rgba(0, 0, 0, 0.45);
			line-height: 1;
		}

		.track {
			position: relative;
			height: 14px;
			margin: 7px 6px 0;
			border-radius: 8px;
			background: rgba(0, 0, 0, 0.35);
			box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);

			.fill {
				height: 100%;
				border-radius: 8px;
				background: linear-gradient(90deg, #5fd068, #ffd23f);
				box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.4);
				transition: width 0.4s ease;
			}

			.star {
				position: absolute;
				top: 50%;
				transform: translate(-50%, -50%);
				font-size: 19px;
				color: #4a2a7a;
				text-shadow: 0 1px 1px rgba(0, 0, 0, 0.4);
				transition: color 0.25s, text-shadow 0.25s, transform 0.25s;
			}
			.star.on {
				color: #ffd23f;
				text-shadow: 0 0 8px rgba(255, 210, 63, 0.9);
				transform: translate(-50%, -50%) scale(1.25);
			}
		}

		.goal {
			font-family: ${CANDY};
			margin-top: 6px;
			font-size: 15px;
			text-transform: lowercase;
			letter-spacing: 0.3px;
			color: rgba(255, 255, 255, 0.9);
		}
	}

	@media (max-width: 480px) {
		.moves,
		.level {
			width: 54px;
			height: 54px;
			.num {
				font-size: 25px;
			}
		}
	}
`;

/* -------------------------------------------------------------------- board */
export const Board = styled.div`
	position: relative;
	display: grid;
	grid-template-columns: repeat(9, 1fr);
	grid-template-rows: repeat(9, 1fr);
	gap: 2px;
	width: min(94vw, 600px);
	aspect-ratio: 1;
	padding: 10px;
	border-radius: 22px;
	background: linear-gradient(180deg, rgba(40, 22, 78, 0.75), rgba(24, 12, 52, 0.85));
	border: 3px solid rgba(255, 255, 255, 0.18);
	box-shadow: inset 0 3px 0 rgba(255, 255, 255, 0.18),
		inset 0 -8px 18px rgba(0, 0, 0, 0.5), 0 14px 40px rgba(0, 0, 0, 0.55);

	.cell {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		border: 2px solid transparent;
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.05);
		box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.35);
		cursor: grab;
		overflow: hidden;
		touch-action: none;
		user-select: none;
		transition: background 0.12s, border-color 0.12s, transform 0.08s;

		img {
			width: 88%;
			height: 88%;
			object-fit: contain;
			filter: drop-shadow(0 3px 3px rgba(0, 0, 0, 0.45));
			pointer-events: none;
			user-select: none;
		}

		&:hover {
			background: rgba(255, 255, 255, 0.12);
		}
		&:active {
			cursor: grabbing;
		}
		&.dragging {
			cursor: grabbing;
			background: rgba(255, 255, 255, 0.18);
			box-shadow: 0 9px 18px rgba(0, 0, 0, 0.4),
				inset 0 1px 2px rgba(255, 255, 255, 0.16);
		}
		&.drag-target {
			background: rgba(255, 210, 63, 0.12);
		}
		&.drag-hidden img {
			opacity: 0;
		}
		&.selected {
			border-color: #ffd23f;
			background: rgba(255, 210, 63, 0.22);
			transform: scale(1.08);
			box-shadow: 0 0 14px rgba(255, 210, 63, 0.7);
		}
		&.hint {
			border-color: #5fd068;
			box-shadow: 0 0 14px rgba(95, 208, 104, 0.85);
		}
		&.invalid {
			animation: ${shake} 0.42s ease;
			border-color: #ff5d73;
			box-shadow: 0 0 12px rgba(255, 93, 115, 0.7);
		}
		/* matched candies animate out, then fresh ones drop in */
		&.clearing img {
			animation: ${clearOut} 0.22s ease forwards;
		}
		&.falling img {
			animation: ${fallIn} 0.34s cubic-bezier(0.34, 1.25, 0.64, 1);
		}
	}

	.combo {
		position: absolute;
		left: 50%;
		top: 38%;
		z-index: 4;
		font-family: ${CANDY};
		font-size: 40px;
		color: #fff;
		text-shadow: 0 2px 0 #e23d7a, 0 0 18px rgba(255, 143, 184, 0.9);
		pointer-events: none;
		animation: ${floatUp} 1.1s ease forwards;
	}
`;

export const DragLayer = styled.div`
	position: absolute;
	inset: 0;
	z-index: 8;
	pointer-events: none;

	.drag-candy {
		position: absolute;
		box-sizing: border-box;
		padding: 4px;
		object-fit: contain;
		filter: drop-shadow(0 10px 10px rgba(0, 0, 0, 0.45));
		will-change: transform;
	}

	.drag-candy.active {
		z-index: 2;
	}

	.drag-candy.target {
		z-index: 1;
	}
`;

/* ----------------------------------------------------------------- controls */
/* The control bar mirrors the top bar: same glossy purple panel, and the
   buttons reuse the round jelly-badge treatment so the HUD reads as one set. */
export const Controls = styled.div`
	width: min(94vw, 600px);
	display: flex;
	justify-content: space-around;
	align-items: center;
	gap: 8px;
	padding: 12px 18px;
	border-radius: 22px;
	background: linear-gradient(180deg, #7b3ff2 0%, #5a23c8 100%);
	box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.35),
		inset 0 -5px 10px rgba(0, 0, 0, 0.3), 0 8px 22px rgba(0, 0, 0, 0.45);

	.act {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 7px;
		padding: 0;
		border: none;
		background: none;
		color: #fff;
		cursor: pointer;
		transition: transform 0.06s, filter 0.15s;

		b {
			width: 52px;
			height: 52px;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 23px;
			line-height: 1;
			text-shadow: 0 2px 2px rgba(0, 0, 0, 0.4);
			box-shadow: inset 0 3px 2px rgba(255, 255, 255, 0.55),
				inset 0 -6px 8px rgba(0, 0, 0, 0.35), 0 4px 8px rgba(0, 0, 0, 0.35);
		}
		span {
			font-family: ${CANDY};
			font-size: 14px;
			text-transform: lowercase;
			letter-spacing: 0.3px;
			opacity: 0.95;
		}

		&:hover:not(:disabled) {
			filter: brightness(1.08);
		}
		&:active:not(:disabled) {
			transform: translateY(2px);
		}
		&:disabled {
			opacity: 0.45;
			cursor: default;
		}
	}

	.hint b {
		background: radial-gradient(circle at 50% 30%, #ffe79a, #f5a623);
		color: #5a3a00;
		text-shadow: none;
	}
	.shuffle b {
		background: radial-gradient(circle at 50% 30%, #8fe7a1, #2fae54);
	}
	.restart b {
		background: radial-gradient(circle at 50% 30%, #6fd6ff, #1f8bd6);
	}
	.quit b {
		background: radial-gradient(circle at 50% 30%, #ff8fb8, #e23d7a);
	}

	@media (max-width: 480px) {
		.act b {
			width: 46px;
			height: 46px;
			font-size: 20px;
		}
	}
`;

/* ------------------------------------------------------------------ overlay */
export const Overlay = styled.div`
	position: absolute;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 22px;
	background: rgba(20, 8, 44, 0.72);
	backdrop-filter: blur(4px);
	z-index: 6;

	.card {
		text-align: center;
		padding: 26px 34px 30px;
		border-radius: 26px;
		background: linear-gradient(180deg, #7b3ff2, #4a1ea8);
		box-shadow: inset 0 3px 0 rgba(255, 255, 255, 0.35),
			0 16px 40px rgba(0, 0, 0, 0.6);
		color: #fff;
		animation: ${pop} 0.32s ease;

		.stars {
			display: flex;
			justify-content: center;
			gap: 6px;
			margin-bottom: 8px;
			span {
				font-size: 40px;
				color: #3a1f6e;
				text-shadow: 0 2px 2px rgba(0, 0, 0, 0.4);
			}
			span.on {
				color: #ffd23f;
				text-shadow: 0 0 14px rgba(255, 210, 63, 0.95);
				animation: ${pop} 0.4s ease;
			}
			span.on:nth-child(2) {
				animation-delay: 0.1s;
			}
			span.on:nth-child(3) {
				animation-delay: 0.2s;
			}
		}

		h2 {
			margin: 4px 0 6px;
			font-family: ${CANDY};
			font-size: 34px;
			text-shadow: 0 2px 0 rgba(0, 0, 0, 0.35);
		}
		p {
			margin: 0 0 18px;
			font-family: ${CANDY};
			font-size: 20px;
			strong {
				color: #ffd23f;
			}
		}
	}

	&.lost .card {
		background: linear-gradient(180deg, #c0506e, #7a2a44);
	}

	.overlay-actions {
		display: flex;
		gap: 10px;
		justify-content: center;

		button {
			padding: 11px 22px;
			border: none;
			border-radius: 14px;
			font-family: ${CANDY};
			font-size: 19px;
			letter-spacing: 0.3px;
			cursor: pointer;
			background: linear-gradient(180deg, #76e08a, #2fae54);
			color: #06280f;
			box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.5),
				0 4px 10px rgba(0, 0, 0, 0.4);

			&.ghost {
				background: rgba(255, 255, 255, 0.16);
				color: #fff;
				box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.4);
			}
		}
	}
`;
