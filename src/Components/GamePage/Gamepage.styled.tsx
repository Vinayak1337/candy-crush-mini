import styled, { keyframes } from 'styled-components';

const drop = keyframes`
	from { transform: translateY(-18px) scale(0.85); opacity: 0; }
	to   { transform: translateY(0) scale(1); opacity: 1; }
`;

const shake = keyframes`
	0%, 100% { transform: translateX(0); }
	25% { transform: translateX(-4px); }
	75% { transform: translateX(4px); }
`;

const pop = keyframes`
	0% { transform: scale(0.6); opacity: 0; }
	60% { transform: scale(1.15); opacity: 1; }
	100% { transform: scale(1); }
`;

export const GameContainer = styled.div`
	display: flex;
	gap: 24px;
	align-items: center;
	justify-content: center;
	height: 100vh;
	width: 100vw;
	padding: 24px;
	box-sizing: border-box;
	font-family: 'Segoe UI', system-ui, sans-serif;

	@media (max-width: 760px) {
		flex-direction: column;
		gap: 14px;
		padding: 12px;
		justify-content: flex-start;
		overflow-y: auto;
	}
`;

export const HUD = styled.div`
	width: 240px;
	flex-shrink: 0;
	background: rgba(12, 22, 40, 0.82);
	backdrop-filter: blur(6px);
	border: 1px solid rgba(120, 170, 255, 0.25);
	border-radius: 16px;
	padding: 20px;
	color: #eaf2ff;
	box-shadow: 0 10px 40px rgba(0, 0, 0, 0.45);

	h1 {
		margin: 0 0 4px;
		font-size: 20px;
		letter-spacing: 0.4px;
		color: #ffd36e;
		text-shadow: 0 2px 0 rgba(0, 0, 0, 0.35);
	}

	.level {
		font-size: 13px;
		color: #9fb6da;
		margin-bottom: 16px;
	}

	.stat {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin: 8px 0;

		span {
			font-size: 12px;
			text-transform: uppercase;
			letter-spacing: 0.6px;
			color: #8ea6cc;
		}
		strong {
			font-size: 18px;
			font-variant-numeric: tabular-nums;
		}
		strong.low {
			color: #ff7a7a;
		}
	}

	.bar {
		margin-top: 14px;
		height: 10px;
		border-radius: 6px;
		background: rgba(255, 255, 255, 0.1);
		overflow: hidden;

		.fill {
			height: 100%;
			border-radius: 6px;
			background: linear-gradient(90deg, #4ad06a, #ffd36e);
			transition: width 0.35s ease;
		}
	}
	.pct {
		margin-top: 6px;
		font-size: 11px;
		color: #8ea6cc;
	}

	.combo {
		margin-top: 14px;
		text-align: center;
		font-weight: 700;
		font-size: 18px;
		color: #ffd36e;
		animation: ${pop} 0.4s ease;
	}

	.actions {
		margin-top: 18px;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;

		button {
			padding: 9px 6px;
			border-radius: 9px;
			border: 1px solid rgba(120, 170, 255, 0.3);
			background: #1b2d4d;
			color: #eaf2ff;
			font-size: 13px;
			cursor: pointer;
			transition: background 0.15s, border-color 0.15s, transform 0.05s;

			&:hover:not(:disabled) {
				background: #25406e;
				border-color: #7aa0ff;
			}
			&:active:not(:disabled) {
				transform: translateY(1px);
			}
			&:disabled {
				opacity: 0.45;
				cursor: default;
			}
			&.quit {
				background: #3a1d28;
				border-color: rgba(255, 120, 140, 0.35);
			}
		}
	}

	@media (max-width: 760px) {
		width: 100%;
		max-width: 420px;
		display: grid;
		grid-template-columns: 1fr 1fr;
		column-gap: 16px;
		h1,
		.level,
		.bar,
		.pct,
		.actions {
			grid-column: 1 / -1;
		}
	}
`;

export const BoardGrid = styled.div`
	position: relative;
	display: grid;
	grid-template-columns: repeat(9, 1fr);
	grid-template-rows: repeat(9, 1fr);
	gap: 3px;
	width: min(86vh, 560px);
	height: min(86vh, 560px);
	padding: 10px;
	background: rgba(20, 32, 56, 0.7);
	border: 2px solid rgba(120, 170, 255, 0.3);
	border-radius: 14px;
	box-shadow: 0 12px 50px rgba(0, 0, 0, 0.5);

	.cell {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		border: 2px solid transparent;
		border-radius: 10px;
		background: rgba(255, 255, 255, 0.04);
		cursor: pointer;
		transition: background 0.12s, border-color 0.12s, transform 0.08s;

		img {
			width: 86%;
			height: 86%;
			object-fit: contain;
			animation: ${drop} 0.25s ease;
			pointer-events: none;
		}

		&:hover {
			background: rgba(255, 255, 255, 0.1);
		}
		&.selected {
			border-color: #ffd36e;
			background: rgba(255, 211, 110, 0.18);
			transform: scale(1.06);
		}
		&.hint {
			border-color: #4ad06a;
			box-shadow: 0 0 12px rgba(74, 208, 106, 0.7);
		}
		&.invalid {
			animation: ${shake} 0.28s ease;
			border-color: #ff7a7a;
		}
	}

	@media (max-width: 760px) {
		width: min(94vw, 460px);
		height: min(94vw, 460px);
		gap: 2px;
		padding: 6px;
	}
`;

export const Overlay = styled.div`
	position: absolute;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 14px;
	background: rgba(6, 12, 24, 0.78);
	backdrop-filter: blur(3px);
	z-index: 5;

	.card {
		text-align: center;
		padding: 28px 32px;
		border-radius: 16px;
		background: #11203a;
		border: 1px solid rgba(120, 170, 255, 0.3);
		animation: ${pop} 0.3s ease;
		color: #eaf2ff;

		h2 {
			margin: 0 0 8px;
			font-size: 26px;
			color: #ffd36e;
		}
		p {
			margin: 0 0 18px;
			color: #c5d4ee;
			strong {
				color: #fff;
			}
		}
	}

	&.won .card h2 {
		color: #6df09a;
	}
	&.lost .card h2 {
		color: #ff8a8a;
	}

	.overlay-actions {
		display: flex;
		gap: 10px;
		justify-content: center;

		button {
			padding: 10px 18px;
			border-radius: 10px;
			border: none;
			background: #4ad06a;
			color: #06210f;
			font-weight: 700;
			font-size: 14px;
			cursor: pointer;

			&.ghost {
				background: transparent;
				border: 1px solid rgba(200, 215, 240, 0.4);
				color: #c5d4ee;
				font-weight: 500;
			}
		}
	}
`;
